import type { PatternDataMessage, StopCode } from "@common/main";
import {
  hexToRGB,
  createChronometer,
  lastUpdateTracker,
  sleep,
} from "@common/index";

import type { ShapeNode } from "./types";
import { AbortController } from "./abortController";
import { SLEEP_INTERVAL } from "./constants";
import { postGenerationProgress } from "./messages";

function createNoiseFilter(
  noiseMode: PatternDataMessage["noiseMode"],
  noiseAmount: number,
) {
  switch (noiseMode) {
    case "ascending":
      return (verticalPosition: number) =>
        Math.random() <
        Math.min(verticalPosition, noiseAmount * verticalPosition);
    case "descending":
      return (verticalPosition: number) => {
        const position = 1 - verticalPosition;
        return Math.random() < Math.min(position, noiseAmount * position);
      };
    case "uniform":
      return () => Math.random() < noiseAmount;
    default:
      return null;
  }
}

function createFadeModifier(
  verticalFadeMode: PatternDataMessage["verticalFadeMode"],
) {
  switch (verticalFadeMode) {
    case "ascending":
      return (verticalPosition: number, opacity: number) =>
        opacity * verticalPosition;
    case "descending":
      return (verticalPosition: number, opacity: number) =>
        opacity * (1 - verticalPosition);
    default:
      return () => 1;
  }
}

function createOpacityThresholdFilter(
  opacityThresholdMode: PatternDataMessage["opacityThresholdMode"],
  opacityMin: number,
  opacityMax: number,
) {
  switch (opacityThresholdMode) {
    case "clamp":
      return (opacity: number) =>
        Math.min(Math.max(opacity, opacityMin), opacityMax);
    case "remove":
      return (opacity: number) =>
        opacity < opacityMin || opacity > opacityMax ? null : opacity;
    default:
      return (opacity: number) => opacity;
  }
}

function createOpacityValueGenerator(min: number, max: number) {
  const delta = max - min;
  return () => delta * Math.random() + min;
}

function colorGenerator(colors: RGB[]) {
  if (colors.length === 1) return () => colors[0];
  return () => colors[Math.floor(Math.random() * colors.length)];
}

function transformRange01(range: [number, number], maxValue: number) {
  return [range[0] / maxValue, range[1] / maxValue];
}

function createOutputFrame(width: number, height: number) {
  // Create output frame
  const outputFrame = figma.createFrame();
  outputFrame.name = "Generated Pattern";
  outputFrame.resize(width, height);
  outputFrame.fills = [];
  outputFrame.clipsContent = false;
  figma.currentPage.appendChild(outputFrame);

  // Center output frame in viewport
  outputFrame.x = figma.viewport.center.x - width * 0.5;
  outputFrame.y = figma.viewport.center.y - height * 0.5;
  figma.currentPage.selection = [outputFrame];
  outputFrame.expanded = false;

  return outputFrame;
}

function createTemplateElement(
  shape: PatternDataMessage["shape"],
  width: number,
  height: number,
) {
  const element = figma.createRectangle();
  element.resize(width, height);
  element.cornerRadius = shape === "circle" ? width * 0.5 : 0;
  element.fills = [];
  element.strokes = [];
  element.strokeWeight = 0;
  element.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  return element;
}

function groupNodes(name: string, nodes: SceneNode[], parent: FrameNode) {
  if (nodes.length === 0) return;

  const group = figma.group(nodes, figma.currentPage);
  group.name = name;
  group.expanded = false;

  parent.appendChild(group);
}

function createShapeCloner(
  shape: ShapeNode,
  getNewColor: () => RGB,
  dimensions: {
    width: number;
    height: number;
    paddingX: number;
    paddingY: number;
  },
) {
  const { width, height, paddingX, paddingY } = dimensions;
  const halfPaddingX = paddingX * 0.5;
  const halfPaddingY = paddingY * 0.5;
  let newElement: ShapeNode;
  const constraints: Constraints = { horizontal: "SCALE", vertical: "SCALE" };

  return (x: number, y: number, opacity: number) => {
    newElement = shape.clone();

    newElement.x = x * width + halfPaddingX;
    newElement.y = y * height + halfPaddingY;

    newElement.fills = [
      {
        type: "SOLID",
        color: getNewColor(),
        opacity,
      },
    ];

    newElement.name = `${x}-${y}`;
    newElement.constraints = constraints;

    return newElement;
  };
}

type GeneratorStopCode = StopCode | "completed";

async function generatePattern(
  msg: PatternDataMessage,
  abortController: AbortController<GeneratorStopCode>,
) {
  const {
    frameWidth,
    frameHeight,
    horizontalElementsCount,
    verticalElementsCount,
    paddingX,
    paddingY,
    colors,
    shape,
    opacityRange,
    opacityRangeLimits,
    opacityThresholdMode,
    noiseMode,
    noiseAmount,
    verticalFadeMode,
  } = msg;
  const { signal } = abortController;

  // Elements
  const elementWidth = frameWidth / horizontalElementsCount;
  const elementHeight = frameHeight / verticalElementsCount;
  const outputFrame = createOutputFrame(+frameWidth, +frameHeight);

  const element = createTemplateElement(
    shape,
    elementWidth - paddingX,
    elementHeight - paddingY,
  );
  const getNewColor = colorGenerator(colors.map(hexToRGB));
  const getShapeClone = createShapeCloner(element, getNewColor, {
    width: elementWidth,
    height: elementHeight,
    paddingX,
    paddingY,
  });

  // Properties and filters
  const [opacityMin, opacityMax] = transformRange01(
    opacityRange,
    opacityRangeLimits[1],
  );
  const noiseFilter = createNoiseFilter(noiseMode, noiseAmount);
  const fadeModifier = createFadeModifier(verticalFadeMode);
  const getOpacityValue = createOpacityValueGenerator(opacityMin, opacityMax);
  const opacityThresholdFilter = createOpacityThresholdFilter(
    opacityThresholdMode,
    opacityMin,
    opacityMax,
  );

  // Utilities
  const percentage = 0;
  const chronometer = createChronometer();
  const shouldUpdate = lastUpdateTracker(150);
  const totalElements = horizontalElementsCount * verticalElementsCount;
  const postUpdate = async (percentage: number) => {
    postGenerationProgress({
      percentage,
      timeElapsed: chronometer(),
    });
    await sleep(SLEEP_INTERVAL);
  };

  // Generation
  for (let y = 0; y < verticalElementsCount; y++) {
    if (signal.aborted) break;

    const verticalPosition =
      verticalElementsCount > 1 ? y / (verticalElementsCount - 1) : 1;

    const layerNodes: SceneNode[] = [];

    for (let x = 0; x < horizontalElementsCount; x++) {
      if (signal.aborted) break;
      if (shouldUpdate())
        await postUpdate((y * horizontalElementsCount + x) / totalElements);

      if (noiseFilter?.(verticalPosition)) continue;

      let opacity: number | null = getOpacityValue();
      opacity = fadeModifier(verticalPosition, opacity);
      opacity = opacityThresholdFilter(opacity);
      if (opacity === null) continue;

      const newElement = getShapeClone(x, y, opacity);
      layerNodes.push(newElement);
    }

    // Abort clause
    if (outputFrame === null) {
      abortController.abort("aborted");
      layerNodes.forEach((node) => node.remove());
    }

    groupNodes(`Layer ${y}`, layerNodes, outputFrame);

    // Update progress
    if (shouldUpdate()) await postUpdate((y + 1) / verticalElementsCount);
  }

  element.remove();

  // Abort clause
  if (signal.aborted && signal.type === "aborted") outputFrame.remove();

  // Results
  return {
    percentage,
    timeElapsed: chronometer(),
    status: signal.type ?? "completed",
  };
}

export default class Generator {
  private abortController: AbortController<GeneratorStopCode>;

  constructor() {
    this.abortController = new AbortController<GeneratorStopCode>();
  }

  start(msg: PatternDataMessage) {
    return generatePattern(msg, this.abortController);
  }

  reset() {
    this.abortController.abort("stopped");
    this.abortController = new AbortController<GeneratorStopCode>();
  }

  stop() {
    this.abortController.abort("stopped");
  }

  abort() {
    this.abortController.abort("aborted");
  }
}

export type Progress = Awaited<ReturnType<typeof generatePattern>>;
