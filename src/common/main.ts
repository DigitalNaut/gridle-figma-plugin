import { z } from "zod";

export const supportedShapes = [
  "square",
  "circle",
  "star",
  "polygon",
  "selection",
] as const;
export const opacityThresholdModes = ["remove", "clamp"] as const;
export const verticalFadeModes = ["ascending", "descending", "none"] as const;

export const noiseModes = [
  "ascending",
  "descending",
  "uniform",
  "none",
] as const;

export type StopCode = "stopped" | "aborted" | undefined;

export const MIN_FRAME_SIZE = 1;
export const MAX_FRAME_SIZE = 1920;
export const OPACITY_RANGE_LIMITS: [number, number] = [0, 100];
export const SIZE_RANGE_LIMITS: [number, number] = [1, 300];
export const ROTATION_RANGE_LIMITS: [number, number] = [-180, 180];
export const defaultColors = ["#86198f", "#f2c80f", "#00917c"]; // Mardi Gras

export const patternDataMessageSchema = z.object({
  frameWidth: z.number().min(MIN_FRAME_SIZE).max(MAX_FRAME_SIZE).default(300),
  frameHeight: z.number().min(MIN_FRAME_SIZE).max(MAX_FRAME_SIZE).default(300),
  columns: z.number().min(1).default(30),
  rows: z.number().min(1).default(30),
  xPadding: z.number().min(0).default(2),
  yPadding: z.number().min(0).default(2),
  colors: z.array(z.string()).min(1).default(defaultColors),
  shape: z.enum(supportedShapes).default(supportedShapes[0]),
  pointCount: z.number().min(3).max(10).default(5),
  cornerRadius: z.number().min(0).default(0),
  rotationRange: z
    .tuple([
      z.number().min(ROTATION_RANGE_LIMITS[0]),
      z.number().max(ROTATION_RANGE_LIMITS[1]),
    ])
    .default([-180, 180]),
  opacityRange: z
    .tuple([
      z.number().min(OPACITY_RANGE_LIMITS[0]),
      z.number().max(OPACITY_RANGE_LIMITS[1]),
    ])
    .default([0, 100]),
  sizeRange: z
    .tuple([
      z.number().min(SIZE_RANGE_LIMITS[0]).max(SIZE_RANGE_LIMITS[1]),
      z.number().min(SIZE_RANGE_LIMITS[0]).max(SIZE_RANGE_LIMITS[1]),
    ])
    .default([100, 210]),
  opacityThresholdMode: z.enum(opacityThresholdModes).default("remove"),
  verticalFadeMode: z.enum(verticalFadeModes).default("none"),
  noiseMode: z.enum(noiseModes).default("uniform"),
  noiseAmount: z.number().min(0).max(1).default(0.5),
});

export type PatternDataMessage = z.infer<typeof patternDataMessageSchema>;
export const defaultInputValues = patternDataMessageSchema.parse({});
