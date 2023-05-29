import type { PatternDataMessage } from "@common";

type GlobalPreset = PatternDataMessage;
type ColorPreset = Pick<PatternDataMessage, "colors">;
type AppearancePreset = Pick<
  GlobalPreset,
  | "shape"
  | "opacityRange"
  | "sizeRange"
  | "noiseMode"
  | "noiseAmount"
  | "verticalFadeMode"
  | "colorGenerationMode"
  | "rowColorOffset"
  | "opacityThresholdMode"
  | "cornerRadius"
  | "pointCount"
  | "rotationRange"
>;

type FramePreset = Pick<
  GlobalPreset,
  "frameWidth" | "frameHeight" | "columns" | "rows" | "xPadding" | "yPadding"
>;

export type Preset = Partial<PatternDataMessage>;

const holiColorPreset: ColorPreset = {
  colors: ["#ffb437", "#bfe7c5", "#1094c4", "#625cd6", "#a042a3", "#ae1d3c"],
};

const diwaliColorPreset: ColorPreset = {
  colors: ["#0a4e01", "#d69d33", "#f3d565", "#fcf4d0", "#c73536", "#b70e16"],
};

const rioCarnivalColorPreset: ColorPreset = {
  colors: ["#f60e26", "#f2337b", "#f6d003", "#077ddf", "#173885"],
};

const chineseNewYearColorPreset: ColorPreset = {
  colors: ["#FF0000", "#FFD700", "#FFFF00", "#FFA500"],
};

const dayOfTheDeadColorPreset: ColorPreset = {
  colors: ["#ec3636", "#f9408c", "#ecbc24", "#053d7a", "#437126"],
};

const prideParadeColorPreset: ColorPreset = {
  colors: ["#d4222c", "#f48a1c", "#fce21c", "#047845", "#24428c", "#742a84"],
};

const mardiGrasColorPreset: ColorPreset = {
  colors: ["#86198f", "#f2c80f", "#00917c"],
};

const bubblegumColorPreset: ColorPreset = {
  colors: ["#f25ec0", "#ffc3c3", "#92f5ff", "#f9ff94", "#87ffb0"],
};

const smallFramePreset: FramePreset = {
  frameWidth: 300,
  frameHeight: 300,
  columns: 30,
  rows: 30,
  xPadding: 2,
  yPadding: 2,
};

const largeFramePreset: FramePreset = {
  frameWidth: 1920,
  frameHeight: 1080,
  columns: 192,
  rows: 108,
  xPadding: 2,
  yPadding: 2,
};

const staticNoiseGlobalPreset: GlobalPreset = {
  frameWidth: 300,
  frameHeight: 300,
  columns: 50,
  rows: 50,
  xPadding: 0,
  yPadding: 0,
  colors: ["#000000", "#ffffff"],
  opacityRange: [0, 100],
  opacityThresholdMode: "clamp",
  sizeRange: [100, 100],
  noiseMode: "none",
  verticalFadeMode: "none",
  colorGenerationMode: "random",
  cornerRadius: 0,
  noiseAmount: 0,
  pointCount: 4,
  rotationRange: [0, 0],
  rowColorOffset: 0,
  shape: "square",
};

const bubblegumAppearancePreset: AppearancePreset = {
  shape: "circle",
  opacityRange: [100, 100],
  sizeRange: [25, 230],
  noiseMode: "uniform",
  noiseAmount: 0.5,
  verticalFadeMode: "none",
  colorGenerationMode: "random",
  rowColorOffset: 0,
  opacityThresholdMode: "remove",
  cornerRadius: 0,
  pointCount: 3,
  rotationRange: [0, 0],
};

const bubblegumGlobalPreset: GlobalPreset = {
  ...smallFramePreset,
  ...bubblegumColorPreset,
  ...bubblegumAppearancePreset,
};

export const framePresets: Record<string, FramePreset> = {
  "Large Frame": largeFramePreset,
} satisfies Record<string, FramePreset>;

export const appearancePresets: Record<string, AppearancePreset> = {
  Bubblegum: bubblegumAppearancePreset,
} satisfies Record<string, AppearancePreset>;

export const colorPresets: Record<string, ColorPreset> ={
  "Mardi Gras": mardiGrasColorPreset,
  Bubblegum: bubblegumColorPreset,
  "Holi Festival": holiColorPreset,
  "Diwali Festival": diwaliColorPreset,
  "Rio Carnival": rioCarnivalColorPreset,
  "Chinese New Year": chineseNewYearColorPreset,
  "Day of the Dead": dayOfTheDeadColorPreset,
  "Pride Parade": prideParadeColorPreset,
} satisfies Record<string, ColorPreset>

export type GlobalPresets = Record<string, GlobalPreset>;

export const globalPresets: GlobalPresets = {
  "Static Noise": staticNoiseGlobalPreset,
  Bubblegum: bubblegumGlobalPreset,
} satisfies GlobalPresets;

export enum AppState {
  IDLE = "idle",
  GENERATING = "generating",
  COMPLETE = "complete",
  STOPPED = "aborted",
  ERROR = "error",
}
