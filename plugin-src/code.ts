figma.showUI(__html__, { height: 300 });

figma.ui.onmessage = (msg) => {
  if (msg.type === "create-rectangles") {
    const {
      width,
      height,
      horizontalCount,
      verticalCount,
      padding,
      alphaThreshold,
      color,
    } = msg;
    const halfPadding = padding * 0.5;
    const nodes = [];

    const squareWidth = width / horizontalCount;
    const squareHeight = height / verticalCount;

    const frame = figma.createFrame();
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
      for (let x = 0; x < horizontalCount; x++) {
        const verticalPosition = y / verticalCount;

        if (Math.random() < 1 - verticalPosition) continue;
        const opacity = Math.random() * verticalPosition;
        if (opacity < alphaThreshold) continue;

        const newRect = rect.clone();

        newRect.x = x * squareWidth + halfPadding;
        newRect.y = y * squareHeight + halfPadding;
        newRect.opacity = opacity;

        newRect.name = `${y}-${x}`;
        nodes.push(newRect);
        frame.appendChild(newRect);
      }
    }

    figma.viewport.scrollAndZoomIntoView(nodes);
    rect.remove();
  }

  figma.closePlugin();
};
