figma.showUI(__html__, { height: 580 });

function generateSquarePattern(msg: GenerateSquaresMessage) {
  const {
    width,
    height,
    horizontalCount,
    verticalCount,
    padding,
    color,
    alphaThreshold,
  } = msg;

  const halfPadding = padding * 0.5;
  const nodes: RectangleNode[] = [];

  const squareWidth = width / horizontalCount;
  const squareHeight = height / verticalCount;

  const frame = figma.createFrame();
  frame.expanded = false;
  frame.name = "Square Pattern";
  frame.resize(width, height);
  figma.currentPage.appendChild(frame);
  frame.fills = [];

  const rect = figma.createRectangle();
  rect.resize(squareWidth - padding, squareHeight - padding);
  rect.fills = [
    {
      type: "SOLID",
      color,
    },
  ];

  for (let y = 0; y < verticalCount; y++) {
    const verticalPosition = y / verticalCount;

    const layerNodes: RectangleNode[] = [];

    for (let x = 0; x < horizontalCount; x++) {
      if (Math.random() < 1 - verticalPosition) continue;
      const opacity = Math.random() * verticalPosition;
      if (opacity < alphaThreshold) continue;

      const newRect = rect.clone();

      newRect.x = x * squareWidth + halfPadding;
      newRect.y = y * squareHeight + halfPadding;
      newRect.opacity = opacity;

      newRect.name = `${y}-${x}`;
      newRect.constraints = {
        horizontal: "SCALE",
        vertical: "SCALE",
      };
      layerNodes.push(newRect);
    }

    if (layerNodes.length === 0) continue;
    const layer = figma.group(layerNodes, frame);
    layer.name = `Layer ${y}`;
    layer.expanded = false;
    frame.appendChild(layer);
  }

  figma.viewport.scrollAndZoomIntoView(nodes);
  rect.remove();
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate-squares") generateSquarePattern(msg);
  figma.closePlugin();
};
