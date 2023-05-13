interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface GenerateSquaresMessage {
  type: "generate-squares";
  width: number;
  height: number;
  horizontalCount: number;
  verticalCount: number;
  padding: number;
  color: RGB;
  alphaThreshold: number;
}
