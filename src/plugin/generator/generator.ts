import type { PatternDataMessage } from "@common/main";
import {
  hexToRGB,
  createChronometer,
  lastUpdateTracker,
  sleep,
} from "@common/index";

import type { GeneratorStopCode, ShapeNode } from "~/types";
import { AbortController } from "~/utils/abortController";
import { SLEEP_INTERVAL } from "~/settings";
import { postGenerationProgress } from "~/messages";

import {
  colorGenerator,
  transformRange01,
  createNoiseFilter,
  createFadeModifier,
  createOpacityValueGenerator,
  createOpacityThresholdFilter,
} from "./filters";

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

  return group;
}

function createShapeCloner(
  shape: ShapeNode,
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

  return (x: number, y: number) => {
    newElement = shape.clone();

    newElement.x = x * width + halfPaddingX;
    newElement.y = y * height + halfPaddingY;

    newElement.name = `Element ${x + 1}`;
    newElement.constraints = constraints;

    return newElement;
  };
}

async function generatePattern(
  message: PatternDataMessage,
  abortController: AbortController<GeneratorStopCode>,
) {
  const {
    frameWidth,
    frameHeight,
    columns,
    rows,
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
  } = message;
  const { signal } = abortController;

  // Elements
  const elementWidth = frameWidth / columns;
  const elementHeight = frameHeight / rows;
  const outputFrame = createOutputFrame(+frameWidth, +frameHeight);

  const sampleElement = createTemplateElement(
    shape,
    elementWidth - paddingX,
    elementHeight - paddingY,
  );
  const getNewColor = colorGenerator(colors.map(hexToRGB));
  const getShapeClone = createShapeCloner(sampleElement, {
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
  let percentProgress = 0;
  const chronometer = createChronometer();
  const shouldUpdate = lastUpdateTracker(150);
  const totalElements = columns * rows;
  const postUpdate = async (percent: number) => {
    percentProgress = percent;
    postGenerationProgress({
      percentProgress,
      timeElapsed: chronometer(),
    });
    await sleep(SLEEP_INTERVAL);
  };

  const sampleRow: SceneNode[] = [];

  // Generate sample row
  for (let x = 0; x < columns; x++) {
    if (signal.aborted) break;
    if (shouldUpdate()) await postUpdate(x / totalElements);

    const newElement = getShapeClone(x, 0);
    sampleRow.push(newElement);
  }

  sampleElement.remove();

  const sampleGroup = groupNodes("Sample Row", sampleRow, outputFrame);
  if (!sampleGroup) abortController.abort("aborted");
  // Generate pattern
  else {
    for (let y = 0; y < rows; y++) {
      if (signal.aborted) break;

      const verticalPosition = rows > 1 ? y / (rows - 1) : 1;

      const rowNodes = sampleGroup.clone();
      if (!rowNodes) {
        abortController.abort("aborted");
        break;
      }

      rowNodes.y = y * elementHeight + paddingY * 0.5;
      rowNodes.name = `Layer ${y + 1}`;
      outputFrame.appendChild(rowNodes);

      const childrenNodes = rowNodes.findChildren(
        (node) =>
          node.type === "RECTANGLE" ||
          node.type === "ELLIPSE" ||
          node.type === "VECTOR" ||
          node.type === "POLYGON" ||
          node.type === "STAR" ||
          node.type === "LINE" ||
          node.type === "TEXT",
      ) as ShapeNode[];

      for (const node of childrenNodes) {
        if (signal.aborted) break;

        if (noiseFilter?.(verticalPosition)) {
          node.remove();
          continue;
        }

        let opacity: number | null = getOpacityValue();
        opacity = fadeModifier(verticalPosition, opacity);
        opacity = opacityThresholdFilter(opacity);
        if (opacity === null) {
          node.remove();
          continue;
        }

        if (node.type === "RECTANGLE")
          node.fills = [{ type: "SOLID", color: getNewColor(), opacity }];
      }

      // Update progress
      if (shouldUpdate()) await postUpdate((y + 1) / rows);
    }

    // Cleanup
    sampleGroup.remove();
  }

  // Abort clause
  if (signal.aborted && signal.type === "aborted") outputFrame.remove();

  // Results
  return {
    percentProgress,
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
