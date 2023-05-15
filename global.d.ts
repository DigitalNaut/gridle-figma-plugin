interface GeneratePatternMessage {
  type: "generate-pattern";
  frameWidth: number;
  frameHeight: number;
  horizontalElementsCount: number;
  verticalElementsCount: number;
  paddingX: number;
  paddingY: number;
  colors: string[];
  shape: "square" | "circle";
  alphaThreshold: number;
  alphaThresholdMode: "remove" | "clamp";
  removeRandom: boolean;
  verticalFadeMode: "ascending" | "descending" | "none";
}
