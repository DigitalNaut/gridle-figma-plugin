export const supportedShapes = ["square", "circle"] as const;

export const opacityThresholdModes = ["remove", "clamp"] as const;

export const verticalFadeModes = ["ascending", "descending", "none"] as const;

export const noiseModes = [
  "ascending",
  "descending",
  "uniform",
  "none",
] as const;

export type supportedShapes = typeof supportedShapes[number];
export type opacityThresholdModes = typeof opacityThresholdModes[number];
export type verticalFadeModes = typeof verticalFadeModes[number];
export type noiseModes = typeof noiseModes[number];
