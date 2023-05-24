import type { PatternDataMessage } from "@common";
import {
  hexToRGB,
  createChronometer,
  lastUpdateTracker,
  sleep,
  OPACITY_RANGE_LIMITS,
} from "@common";

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
  createSizeVariationFilter,
  createRotationVariationFilter,
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

function createTemplateElement({
  shape,
  cornerRadius,
  width,
  height,
  pointCount,
}: {
  shape: PatternDataMessage["shape"];
  cornerRadius: number;
  width: number;
  height: number;
  pointCount: number;
}) {
  let newShape: ShapeNode;

  switch (shape) {
    case "circle":
      newShape = figma.createEllipse();
      break;
    case "star":
      newShape = figma.createStar();
      break;
    case "polygon":
      newShape = figma.createPolygon();
      newShape.pointCount = pointCount;
      break;
    case "square":
      newShape = figma.createRectangle();
      break;
  }

  newShape.resize(width, height);
  newShape.cornerRadius = +cornerRadius;
  newShape.fills = [];
  newShape.strokes = [];
  newShape.strokeWeight = 0;
  newShape.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  return newShape;
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
    xPadding: number;
    yPadding: number;
  },
) {
  const { width, height, xPadding, yPadding } = dimensions;
  const halfXPadding = xPadding * 0.5;
  const halfYPadding = yPadding * 0.5;
  let newElement: ShapeNode;
  const constraints: Constraints = { horizontal: "SCALE", vertical: "SCALE" };

  return (x: number, y: number) => {
    newElement = shape.clone();

    newElement.x = x * width + halfXPadding;
    newElement.y = y * height + halfYPadding;

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
    xPadding,
    yPadding,
    colors,
    shape,
    rotationRange: [minRotation, maxRotation],
    pointCount,
    cornerRadius,
    opacityRange,
    opacityThresholdMode,
    sizeRange,
    noiseMode,
    noiseAmount,
    verticalFadeMode,
  } = message;
  const { signal } = abortController;

  // Elements
  const elementWidth = frameWidth / columns;
  const elementHeight = frameHeight / rows;
  const outputFrame = createOutputFrame(+frameWidth, +frameHeight);

  const sampleElement = createTemplateElement({
    shape,
    cornerRadius,
    width: elementWidth - xPadding,
    height: elementHeight - yPadding,
    pointCount,
  });
  const getNewColor = colorGenerator(colors.map(hexToRGB));
  const getShapeClone = createShapeCloner(sampleElement, {
    width: elementWidth,
    height: elementHeight,
    xPadding,
    yPadding,
  });

  // Properties and filters
  const [minOpacity, maxOpacity] = transformRange01(
    opacityRange,
    OPACITY_RANGE_LIMITS[1],
  );
  const [minSize, maxSize] = transformRange01(sizeRange, 100);
  const noiseFilter = createNoiseFilter(noiseMode, noiseAmount);
  const fadeModifier = createFadeModifier(verticalFadeMode);
  const getOpacityValue = createOpacityValueGenerator(minOpacity, maxOpacity);
  const opacityThresholdFilter = createOpacityThresholdFilter({
    opacityThresholdMode,
    minOpacity,
    maxOpacity,
  });
  const varySizeFilter = createSizeVariationFilter({
    minSize,
    maxSize,
    elementWidth,
    elementHeight,
    xPadding,
    yPadding,
  });
  const varyRotationFilter = createRotationVariationFilter({
    minRotation,
    maxRotation,
  });

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

    const elementClone = getShapeClone(x, 0);
    sampleRow.push(elementClone);
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

      rowNodes.y = y * elementHeight + yPadding * 0.5;
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

        varyRotationFilter?.(node);
        varySizeFilter?.(node);

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
