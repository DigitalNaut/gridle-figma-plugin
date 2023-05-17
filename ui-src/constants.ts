export const MIN_FRAME_SIZE = 1;
export const MAX_FRAME_SIZE = 1920;
export const defaultColors = ["#86198f"];

export const initialInputValues: GeneratePatternMessage = {
  type: "generate-pattern",
  frameWidth: 300,
  frameHeight: 300,
  horizontalElementsCount: 30,
  verticalElementsCount: 30,
  paddingX: 2,
  paddingY: 2,
  opacityRange: [0, 100],
  opacityRangeLimits: [0, 100],
  opacityThresholdMode: "remove",
  colors: defaultColors,
  shape: "square",
  verticalFadeMode: "ascending",
  noiseMode: "ascending",
};
