import type { PatternDataMessage } from "@common/index";

type Preset = Partial<Omit<PatternDataMessage, "opacityRangeLimits" | "type">>;

export const MIN_FRAME_SIZE = 1;
export const MAX_FRAME_SIZE = 1920;
export const OPACITY_RANGE_LIMITS: [number, number] = [0, 100];
export const defaultColors = ["#86198f"];

export const defaultInputValues: PatternDataMessage = {
  type: "generate-pattern",
  frameWidth: 300,
  frameHeight: 300,
  columns: 30,
  rows: 30,
  paddingX: 2,
  paddingY: 2,
  opacityRange: [0, 100],
  opacityRangeLimits: OPACITY_RANGE_LIMITS,
  opacityThresholdMode: "remove",
  colors: defaultColors,
  shape: "square",
  verticalFadeMode: "ascending",
  noiseMode: "descending",
  noiseAmount: 0.5,
};

const largeFramePreset: Partial<Preset> = {
  frameWidth: 1920,
  frameHeight: 1080,
  columns: 192,
  rows: 108,
  paddingX: 2,
  paddingY: 2,
};

const mardiGrasPreset: Partial<Preset> = {
  colors: ["#86198f", "#f2c80f", "#00917c"],
};

const staticNoisePreset: Partial<Preset> = {
  frameWidth: 300,
  frameHeight: 300,
  columns: 50,
  rows: 50,
  paddingX: 0,
  paddingY: 0,
  colors: ["#000000", "#ffffff"],
  opacityRange: [0, 100],
  opacityThresholdMode: "clamp",
  noiseMode: "none",
  verticalFadeMode: "none",
};

const bubbleGumPreset: Partial<Preset> = {
  shape: "circle",
  colors: ["#f25ec0", "#ffc3c3", "#92f5ff", "#f9ff94", "#87ffb0"],
  opacityRange: [100, 100],
  noiseMode: "uniform",
  noiseAmount: 0.5,
  verticalFadeMode: "none",
};

export type PresetRecord = Record<string, Partial<Preset>>;

export const presetInputs = {
  "Large Frame": largeFramePreset,
  "Mardi Gras": mardiGrasPreset,
  "Static Noise": staticNoisePreset,
  "Bubble Gum": bubbleGumPreset,
} satisfies PresetRecord;
