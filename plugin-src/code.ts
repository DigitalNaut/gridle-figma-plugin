import { hexToRGB } from "./utils/color";

figma.showUI(__html__, { height: 780 });

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
    alphaThreshold,
    alphaThresholdMode,
    removeRandom,
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

  for (let y = 0; y < verticalElementsCount; y++) {
    const verticalPosition = y / verticalElementsCount;

    const layerNodes: RectangleNode[] = [];

    for (let x = 0; x < horizontalElementsCount; x++) {
      if (removeRandom && Math.random() > verticalPosition) continue;

      let opacity = Math.random();

      if (verticalFadeMode === "ascending") opacity *= verticalPosition;
      else if (verticalFadeMode === "descending")
        opacity *= 1 - verticalPosition;

      if (opacity < alphaThreshold) {
        if (alphaThresholdMode === "remove") continue;
        else if (alphaThresholdMode === "clamp")
          opacity = Number(alphaThreshold);
      }

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
