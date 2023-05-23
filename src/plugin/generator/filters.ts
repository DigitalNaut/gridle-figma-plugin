import type { PatternDataMessage } from "@common/index";

export function createNoiseFilter(
  noiseMode: PatternDataMessage["noiseMode"],
  noiseAmount: number,
) {
  switch (noiseMode) {
    case "ascending":
      return (verticalPosition: number) =>
        Math.random() <
        Math.min(verticalPosition, noiseAmount * verticalPosition);
    case "descending":
      return (verticalPosition: number) => {
        const position = 1 - verticalPosition;
        return Math.random() < Math.min(position, noiseAmount * position);
      };
    case "uniform":
      return () => Math.random() < noiseAmount;
    default:
      return null;
  }
}

export function createFadeModifier(
  verticalFadeMode: PatternDataMessage["verticalFadeMode"],
) {
  switch (verticalFadeMode) {
    case "ascending":
      return (verticalPosition: number, opacity: number) =>
        opacity * verticalPosition;
    case "descending":
      return (verticalPosition: number, opacity: number) =>
        opacity * (1 - verticalPosition);
    default:
      return (_: number, opacity: number) => opacity;
  }
}

export function createOpacityThresholdFilter(
  opacityThresholdMode: PatternDataMessage["opacityThresholdMode"],
  opacityMin: number,
  opacityMax: number,
) {
  switch (opacityThresholdMode) {
    case "clamp":
      return (opacity: number) =>
        Math.min(Math.max(opacity, opacityMin), opacityMax);
    case "remove":
      return (opacity: number) =>
        opacity < opacityMin || opacity > opacityMax ? null : opacity;
    default:
      return (opacity: number) => opacity;
  }
}

export function createOpacityValueGenerator(min: number, max: number) {
  const delta = max - min;
  return () => delta * Math.random() + min;
}

export function colorGenerator(colors: RGB[]) {
  if (colors.length === 1) return () => colors[0];
  return () => colors[Math.floor(Math.random() * colors.length)];
}

export function transformRange01(range: [number, number], maxValue: number) {
  return [range[0] / maxValue, range[1] / maxValue];
}
