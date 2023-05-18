import type { GeneratePatternMessage } from "@common/index";

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

const largeFramePreset: GeneratePatternMessage = {
  ...initialInputValues,
  frameWidth: 1920,
  frameHeight: 1080,
  horizontalElementsCount: 192,
  verticalElementsCount: 108,
  paddingX: 2,
  paddingY: 2,
};

const mardiGrasPreset: GeneratePatternMessage = {
  ...initialInputValues,
  colors: ["#86198f", "#f2c80f", "#00917c"],
};

const staticNoisePreset: GeneratePatternMessage = {
  ...initialInputValues,
  frameWidth: 300,
  frameHeight: 300,
  horizontalElementsCount: 50,
  verticalElementsCount: 50,
  paddingX: 0,
  paddingY: 0,
  colors: ["#000000", "#ffffff"],
  opacityThresholdMode: "clamp",
  noiseMode: "none",
  verticalFadeMode: "none",
};

const bubbleGumPreset: GeneratePatternMessage = {
  ...initialInputValues,
  shape: "circle",
  colors: ["#f25ec0", "#ffc3c3", "#92f5ff", "#f9ff94", "#87ffb0"],
  opacityRange: [100, 100],
  noiseMode: "uniform",
  verticalFadeMode: "none",
};

export const presetInputs: Record<string, GeneratePatternMessage> = {
  Default: initialInputValues,
  "Large Frame": largeFramePreset,
  "Mardi Gras": mardiGrasPreset,
  "Static Noise": staticNoisePreset,
  "Bubble Gum": bubbleGumPreset,
};
