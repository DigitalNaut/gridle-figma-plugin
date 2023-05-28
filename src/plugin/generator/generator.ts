import type { PatternDataMessage } from "@common";
import {
  hexToRGB,
  createChronometer,
  lastUpdateTracker,
  sleep,
  OPACITY_RANGE_LIMITS,
} from "@common";

import type { GeneratorStopCode, SupportedNode } from "~/types";
import { isSupportedNode } from "~/types";
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
  createOffsetColorGenerator,
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

function loadFonts(node: TextNode) {
  return Promise.all(
    node
      .getRangeAllFontNames(0, node.characters.length)
      .map(figma.loadFontAsync),
  );
}

async function createElementFromSelection({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const [selection] = figma.currentPage.selection;
  const { type } = selection;

  let newShape: SupportedNode;

  if (!isSupportedNode(selection))
    throw new Error("Selection is not supported.");

  if (type === "COMPONENT") {
    newShape = selection.createInstance();
    console.log("Creating instance from component");
  } else if (type === "COMPONENT_SET")
    newShape = selection.defaultVariant.createInstance();
  else if (type === "TEXT") {
    newShape = selection.clone();

    await loadFonts(newShape);

    newShape.textAutoResize = "HEIGHT";
    newShape.textAlignHorizontal = "CENTER";
    newShape.textAlignVertical = "CENTER";

    newShape.rescale(width / newShape.width);

    return newShape;
  } else newShape = selection.clone();

  newShape.constraints = { horizontal: "SCALE", vertical: "SCALE" };

  if (newShape.width >= newShape.height)
    newShape.rescale(width / newShape.width);
  else newShape.rescale(height / newShape.height);

  return newShape;
}

function createShapeElement({
  shape,
  cornerRadius,
  width,
  height,
  pointCount,
}: {
  shape: Exclude<PatternDataMessage["shape"], "selection">;
  cornerRadius: number;
  width: number;
  height: number;
  pointCount: number;
}) {
  let newShape: SupportedNode;

  switch (shape) {
    case "circle":
      newShape = figma.createEllipse();
      break;
    case "star":
      newShape = figma.createStar();
      newShape.cornerRadius = +cornerRadius;
      break;
    case "polygon":
      newShape = figma.createPolygon();
      newShape.pointCount = pointCount;
      newShape.cornerRadius = +cornerRadius;
      break;
    case "square":
      newShape = figma.createRectangle();
      newShape.cornerRadius = +cornerRadius;
      break;
  }

  newShape.resize(width, height);
  newShape.cornerRadius = +cornerRadius;
  newShape.fills = [];
  newShape.strokes = [];
  newShape.strokeWeight = 0;

  return newShape;
}

async function createTemplateElement({
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
  if (shape === "selection")
    return await createElementFromSelection({ width, height });
  else
    return createShapeElement({
      shape,
      cornerRadius,
      width,
      height,
      pointCount,
    });
}

function groupNodes(name: string, nodes: SupportedNode[], parent: FrameNode) {
  if (nodes.length === 0) return;

  const group = figma.group(nodes, figma.currentPage);
  group.name = name;
  group.expanded = false;

  parent.appendChild(group);

  return group;
}

function createShapeCloner(
  shape: SupportedNode,
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
  let newElement: SupportedNode;
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
    colorGenerationMode,
    rowColorOffset,
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

  const sampleElement = await createTemplateElement({
    shape,
    width: elementWidth - xPadding,
    height: elementHeight - yPadding,
    cornerRadius,
    pointCount,
  });
  console.log("Created sample element:", sampleElement.type);

  const outputFrame = createOutputFrame(+frameWidth, +frameHeight);

  const getNewColor =
    colors.length > 0
      ? colorGenerator(colors.map(hexToRGB), colorGenerationMode)
      : null;
  const getShapeClone = createShapeCloner(sampleElement, {
    width: elementWidth,
    height: elementHeight,
    xPadding,
    yPadding,
  });
  const getRowColorOffset = createOffsetColorGenerator(
    colorGenerationMode !== "cycle",
    rowColorOffset,
  );

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
    useScale: shape === "selection",
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

  const sampleRow: SupportedNode[] = [];

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
    sampleGroup.visible = false;

    for (let y = 0; y < rows; y++) {
      if (signal.aborted) break;

      const verticalPosition = rows > 1 ? y / (rows - 1) : 1;

      const rowNodes = sampleGroup.clone();
      if (!rowNodes) {
        abortController.abort("aborted");
        break;
      }

      rowNodes.visible = true;
      rowNodes.y = y * elementHeight + yPadding * 0.5;
      rowNodes.name = `Layer ${y + 1}`;
      outputFrame.appendChild(rowNodes);

      for (const node of rowNodes.children as SupportedNode[]) {
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
        node.opacity = opacity;

        varySizeFilter(node);
        varyRotationFilter(node);

        if (getNewColor)
          node.fills = [
            { type: "SOLID", color: getNewColor(getRowColorOffset?.(y)) },
          ];
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
