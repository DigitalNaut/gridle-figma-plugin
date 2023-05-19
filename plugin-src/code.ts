import type { PatternDataMessage, StopCode } from "@common/index";
import {
  createChronometer,
  hexToRGB,
  lastUpdateTracker,
  sleep,
} from "@common/utils/index";
import {
  postGenerationProgress,
  postGenerationStart,
  postGenerationCompleted,
  postGenerationStopped,
  postGenerationError,
} from "./messages";
import { SLEEP_INTERVAL } from "./constants";

figma.showUI(__html__, { width: 340, height: 650, position: { x: 0, y: 0 } });

function createNoiseFilter(
  noiseMode: PatternDataMessage["noiseMode"],
  noiseAmount: number
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
  verticalFadeMode: PatternDataMessage["verticalFadeMode"]
) {
  switch (verticalFadeMode) {
    case "ascending":
      return (verticalPosition: number) => verticalPosition;
    case "descending":
      return (verticalPosition: number) => 1 - verticalPosition;
    default:
      return () => 1;
  }
}

function createOpacityThresholdFilter(
  opacityThresholdMode: PatternDataMessage["opacityThresholdMode"],
  opacityMin: number,
  opacityMax: number
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
  height: number
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

function elementCloneGenerator(
  element: RectangleNode,
  getNewColor: () => RGB,
  dimensions: {
    width: number;
    height: number;
    paddingX: number;
    paddingY: number;
  }
) {
  const { width, height, paddingX, paddingY } = dimensions;
  const halfPaddingX = paddingX * 0.5;
  const halfPaddingY = paddingY * 0.5;
  let newElement: RectangleNode;
  const constraints: Constraints = { horizontal: "SCALE", vertical: "SCALE" };

  return (x: number, y: number, opacity: number) => {
    newElement = element.clone();

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

let stopFlag: StopCode;

async function generatePattern(msg: PatternDataMessage) {
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

  stopFlag = undefined;

  // Elements
  const elementWidth = frameWidth / horizontalElementsCount;
  const elementHeight = frameHeight / verticalElementsCount;
  const outputFrame = createOutputFrame(+frameWidth, +frameHeight);

  const element = createTemplateElement(
    shape,
    elementWidth - paddingX,
    elementHeight - paddingY
  );
  const getNewColor = colorGenerator(colors.map(hexToRGB));
  const getElementClone = elementCloneGenerator(element, getNewColor, {
    width: elementWidth,
    height: elementHeight,
    paddingX,
    paddingY,
  });

  // Properties and filters
  const [opacityMin, opacityMax] = transformRange01(
    opacityRange,
    opacityRangeLimits[1]
  );
  const opacityDelta = opacityMax - opacityMin;
  const noiseFilter = createNoiseFilter(noiseMode, noiseAmount);
  const fadeModifier = createFadeModifier(verticalFadeMode);
  const opacityThresholdFilter = createOpacityThresholdFilter(
    opacityThresholdMode,
    opacityMin,
    opacityMax
  );

  // Utilities
  let percentage = 0;
  const chronometer = createChronometer();
  const shouldUpdate = lastUpdateTracker(150);
  const totalElements = horizontalElementsCount * verticalElementsCount;

  for (let y = 0; y < verticalElementsCount; y++) {
    if (stopFlag) break;

    const verticalPosition =
      verticalElementsCount > 1 ? y / (verticalElementsCount - 1) : 1;

    const layerNodes: RectangleNode[] = [];

    for (let x = 0; x < horizontalElementsCount; x++) {
      if (stopFlag) break;
      if (shouldUpdate()) {
        percentage = (y * horizontalElementsCount + x) / totalElements;
        postGenerationProgress({
          percentage,
          timeElapsed: chronometer(),
        });
        await sleep(SLEEP_INTERVAL);
      }

      if (noiseFilter?.(verticalPosition)) continue;

      let opacity: number | null = Math.random() * opacityDelta + opacityMin;
      opacity *= fadeModifier(verticalPosition);
      opacity = opacityThresholdFilter(opacity);
      if (opacity === null) continue;

      const newElement = getElementClone(x, y, opacity);
      layerNodes.push(newElement);
    }

    if (outputFrame === null) stopFlag = "aborted";
    groupNodes(`Layer ${y}`, layerNodes, outputFrame);

    if (shouldUpdate()) {
      percentage = (y + 1) / verticalElementsCount;
      postGenerationProgress({
        percentage,
        timeElapsed: chronometer(),
      });
      await sleep(SLEEP_INTERVAL);
    }
  }

  element.remove();

  if (stopFlag === "aborted") outputFrame.remove();
  return { percentage, stopFlag, timeElapsed: chronometer() };
}

figma.ui.onmessage = (msg) => {
  const { type } = msg || {};

  switch (type) {
    case "generate-pattern":
      postGenerationStart();

      generatePattern(msg)
        .then((result) => {
          if (result.stopFlag) postGenerationStopped(result);
          else postGenerationCompleted(result);
        })
        .catch((error) => {
          if (error instanceof Error) postGenerationError(error.message);
          else postGenerationError("Unknown error");

          figma.notify("Error generating pattern");
          console.error(error);
        });
      break;

    case "generate-abort":
      console.log("Aborting...");
      stopFlag = "aborted";
      break;

    case "generate-stop":
      console.log("Stopping...");
      stopFlag = "stopped";
      break;

    case "close":
      figma.closePlugin();
      break;

    default:
      break;
  }
};
