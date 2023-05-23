import { z } from "zod";

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

export const patternDataMessageSchema = z.object({
  type: z.literal("generate-pattern"),
  frameWidth: z.number(),
  frameHeight: z.number(),
  columns: z.number(),
  rows: z.number(),
  xPadding: z.number(),
  yPadding: z.number(),
  colors: z.array(z.string()),
  shape: z.enum(supportedShapes),
  opacityRange: z.tuple([z.number(), z.number()]),
  opacityRangeLimits: z.tuple([z.number(), z.number()]),
  sizeRange: z.tuple([z.number(), z.number()]),
  sizeRangeLimits: z.tuple([z.number(), z.number()]),
  opacityThresholdMode: z.enum(opacityThresholdModes),
  verticalFadeMode: z.enum(verticalFadeModes),
  noiseMode: z.enum(noiseModes),
  noiseAmount: z.number(),
});

export type PatternDataMessage = z.infer<typeof patternDataMessageSchema>;

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
