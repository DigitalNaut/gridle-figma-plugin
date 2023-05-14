interface GenerateSquaresMessage {
  type: "generate-squares";
  frameWidth: number;
  frameHeight: number;
  horizontalSquaresCount: number;
  verticalSquaresCount: number;
  padding: number;
  colors: string;
  alphaThreshold: number;
  alphaThresholdMode: "remove" | "clamp";
  removeRandom: boolean;
}
