export const MIN_FRAME_SIZE = 1;
export const MAX_FRAME_SIZE = 1920;
export const initialInputValues: GeneratePatternMessage = {
  type: "generate-pattern",
  frameWidth: 300,
  frameHeight: 300,
  horizontalElementsCount: 30,
  verticalElementsCount: 30,
  paddingX: 2,
  paddingY: 2,
  alphaThreshold: 0.05,
  alphaThresholdMode: "remove",
  colors: ["#86198f"],
  shape: "square",
  removeRandom: true,
  verticalFadeMode: "ascending",
};
