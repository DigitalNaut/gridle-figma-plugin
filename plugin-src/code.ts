import { hexToRGB } from "./utils/color";

figma.showUI(__html__, { width: 340, height: 650 });

function noiseFilter(
  noiseMode: GeneratePatternMessage["noiseMode"],
  verticalPosition: number
) {
  switch (noiseMode) {
    case "ascending":
      return Math.random() > verticalPosition;
    case "descending":
      return Math.random() > 1 - verticalPosition;
    case "uniform":
      return Math.random() > 0.5;
    default:
      return false;
  }
}

function fadeFilter(
  verticalFadeMode: GeneratePatternMessage["verticalFadeMode"],
  verticalPosition: number
) {
  if (verticalFadeMode === "ascending") return verticalPosition;
  if (verticalFadeMode === "descending") return 1 - verticalPosition;
  return 1;
}

function transformRange(rawRange: [number, number], base: number) {
  return [rawRange[0] / base, rawRange[1] / base];
}

function generatePattern(msg: GeneratePatternMessage) {
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
    opacityThresholdMode,
    noiseMode,
    verticalFadeMode,
  } = msg;

  const elementWidth = frameWidth / horizontalElementsCount;
  const elementHeight = frameHeight / verticalElementsCount;

  const frame = figma.createFrame();
  frame.name = "Generated Pattern";
  frame.resize(Number(frameWidth), Number(frameHeight));
  frame.fills = [];
  frame.clipsContent = false;
  figma.currentPage.appendChild(frame);

  const element = figma.createRectangle();
  if (shape === "circle") element.cornerRadius = elementWidth * 0.5;
  element.resize(elementWidth - paddingX, elementHeight - paddingY);

  const [opacityMin, opacityMax] = transformRange(opacityRange, 100);
  const opacityDelta = opacityMax - opacityMin;

  for (let y = 0; y < verticalElementsCount; y++) {
    const verticalPosition = y / (verticalElementsCount - 1);

    const layerNodes: RectangleNode[] = [];

    for (let x = 0; x < horizontalElementsCount; x++) {
      if (noiseFilter(noiseMode, verticalPosition)) continue;

      let opacity = Math.random() * opacityDelta + opacityMin;

      opacity *= fadeFilter(verticalFadeMode, verticalPosition);

      if (opacityThresholdMode === "clamp")
        opacity = Math.min(Math.max(opacity, opacityMin), opacityMax);
      if (opacityThresholdMode === "remove")
        if (opacity < opacityMin || opacity > opacityMax) continue;

      const newElement = element.clone();

      newElement.x = x * elementWidth + paddingX * 0.5;
      newElement.y = y * elementHeight + paddingY * 0.5;
      const randomColor =
        colors.length === 1
          ? colors[0]
          : colors[Math.floor(Math.random() * colors.length)];
      newElement.fills = [
        { type: "SOLID", color: hexToRGB(randomColor), opacity },
      ];

      newElement.name = `${y}-${x}`;
      newElement.constraints = { horizontal: "SCALE", vertical: "SCALE" };
      layerNodes.push(newElement);
    }

    if (layerNodes.length === 0) continue;
    const layer = figma.group(layerNodes, frame);
    layer.name = `Layer ${y}`;
    layer.expanded = false;
    frame.appendChild(layer);
  }

  frame.x = figma.viewport.center.x - frameWidth * 0.5;
  frame.y = figma.viewport.center.y - frameHeight * 0.5;
  figma.currentPage.selection = [frame];
  frame.expanded = false;

  element.remove();
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate-pattern") generatePattern(msg);
  if (msg.type === "close") figma.closePlugin();
};
