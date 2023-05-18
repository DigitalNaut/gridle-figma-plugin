export const supportedShapes = ["square", "circle"];

export const opacityThresholdModes = ["remove", "clamp"];

export const verticalFadeModes = ["ascending", "descending", "none"];

export const noiseModes = [
  "ascending",
  "descending",
  "uniform",
  "none",
];

export type GeneratePatternMessage = {
  type: "generate-pattern";
  frameWidth: number;
  frameHeight: number;
  horizontalElementsCount: number;
  verticalElementsCount: number;
  paddingX: number;
  paddingY: number;
  colors: string[];
  shape: (typeof supportedShapes)[number];
  opacityRange: [number, number];
  opacityRangeLimits: [number, number];
  opacityThresholdMode: (typeof opacityThresholdModes)[number];
  verticalFadeMode: typeof verticalFadeModes[number];
  noiseMode: typeof noiseModes[number];
};
