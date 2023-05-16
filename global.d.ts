declare enum supportedShapes {
  square,
  circle,
}

declare enum alphaThresholdModes {
  remove,
  clamp,
}

declare enum verticalFadeModes {
  ascending,
  descending,
  none,
}

declare enum noiseModes {
  ascending,
  descending,
  uniform,
  none,
}

type GeneratePatternMessage = {
  type: "generate-pattern";
  frameWidth: number;
  frameHeight: number;
  horizontalElementsCount: number;
  verticalElementsCount: number;
  paddingX: number;
  paddingY: number;
  colors: string[];
  shape: keyof typeof supportedShapes;
  alphaThreshold: number;
  alphaThresholdMode: keyof typeof alphaThresholdModes;
  verticalFadeMode: keyof typeof verticalFadeModes;
  noiseMode: keyof typeof noiseModes;
};
