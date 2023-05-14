import { hexToRGB } from "./utils/color";

figma.showUI(__html__, { height: 740 });

function generateSquarePattern(msg: GenerateSquaresMessage) {
  const {
    frameWidth,
    frameHeight,
    horizontalSquaresCount,
    verticalSquaresCount,
    padding,
    colors,
    alphaThreshold,
    alphaThresholdMode,
    removeRandom,
  } = msg;

  const squareWidth = frameWidth / horizontalSquaresCount;
  const squareHeight = frameHeight / verticalSquaresCount;

  const frame = figma.createFrame();
  frame.name = "Square Pattern";
  frame.resize(Number(frameWidth), Number(frameHeight));
  frame.fills = [];
  frame.clipsContent = false;
  figma.currentPage.appendChild(frame);

  const rect = figma.createRectangle();
  rect.resize(squareWidth - padding, squareHeight - padding);

  for (let y = 0; y < verticalSquaresCount; y++) {
    const verticalPosition = y / verticalSquaresCount;

    const layerNodes: RectangleNode[] = [];

    for (let x = 0; x < horizontalSquaresCount; x++) {
      if (removeRandom && Math.random() > verticalPosition) continue;

      let opacity = Math.random() * verticalPosition;
      if (opacity < alphaThreshold) {
        if (alphaThresholdMode === "remove") continue;
        else if (alphaThresholdMode === "clamp")
          opacity = Number(alphaThreshold);
      }

      const newRect = rect.clone();

      newRect.x = x * squareWidth + padding * 0.5;
      newRect.y = y * squareHeight + padding * 0.5;
      newRect.fills = [{ type: "SOLID", color: hexToRGB(colors), opacity }];

      newRect.name = `${y}-${x}`;
      newRect.constraints = { horizontal: "SCALE", vertical: "SCALE" };
      layerNodes.push(newRect);
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

  rect.remove();
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate-squares") generateSquarePattern(msg);
  if (msg.type === "close") figma.closePlugin();
};
