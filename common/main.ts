import type {
  noiseModes,
  opacityThresholdModes,
  supportedShapes,
  verticalFadeModes,
} from "./settings";

export type GeneratePatternMessage = {
  type: "generate-pattern";
  frameWidth: number;
  frameHeight: number;
  horizontalElementsCount: number;
  verticalElementsCount: number;
  paddingX: number;
  paddingY: number;
  colors: string[];
  shape: supportedShapes;
  opacityRange: [number, number];
  opacityRangeLimits: [number, number];
  opacityThresholdMode: opacityThresholdModes;
  verticalFadeMode: verticalFadeModes;
  noiseMode: noiseModes;
};
