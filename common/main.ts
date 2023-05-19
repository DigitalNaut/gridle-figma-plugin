export const supportedShapes = ["square", "circle"] as const;

export const opacityThresholdModes = ["remove", "clamp"] as const;

export const verticalFadeModes = ["ascending", "descending", "none"] as const;

export const noiseModes = [
  "ascending",
  "descending",
  "uniform",
  "none",
] as const;

export type StopCode = "stopped" | "aborted" | undefined;

export type Progress = {
  percentage: number;
  timeElapsed: number;
  stopFlag: StopCode;
};

export type PatternDataMessage = {
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
  opacityRangeLimits: readonly [number, number];
  opacityThresholdMode: (typeof opacityThresholdModes)[number];
  verticalFadeMode: (typeof verticalFadeModes)[number];
  noiseMode: (typeof noiseModes)[number];
  noiseAmount: number;
};