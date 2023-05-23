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

export type PatternDataMessage = {
  type: "generate-pattern";
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  xPadding: number;
  yPadding: number;
  colors: string[];
  shape: (typeof supportedShapes)[number];
  opacityRange: [number, number];
  opacityRangeLimits: readonly [number, number];
  sizeRange: [number, number];
  sizeRangeLimits: readonly [number, number];
  opacityThresholdMode: (typeof opacityThresholdModes)[number];
  verticalFadeMode: (typeof verticalFadeModes)[number];
  noiseMode: (typeof noiseModes)[number];
  noiseAmount: number;
};

export const messageTypes = {
  close: "close",
  UIStarted: "UI-started",
  generationProgress: "generation-progress",
  generationComplete: "generation-complete",
  generationStarted: "generation-started",
  generationStopped: "generation-stopped",
  generationError: "generation-error",
  generationStart: "generation-start",
  generationAbort: "generation-abort",
  generationStop: "generation-stop",
  presetLoaded: "preset-loaded",
  savePreset: "save-preset",
  loadPreset: "load-preset",
  clearPreset: "clear-preset",
};
