import type { PatternDataMessage } from "@common/index";

import type { ShapeNode } from "~/types";
import { transformRotateAxis2D } from "~/utils/math";

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

export function createOpacityThresholdFilter({
  opacityThresholdMode,
  minOpacity,
  maxOpacity,
}: {
  opacityThresholdMode: PatternDataMessage["opacityThresholdMode"];
  minOpacity: number;
  maxOpacity: number;
}) {
  switch (opacityThresholdMode) {
    case "clamp":
      return (opacity: number) =>
        Math.min(Math.max(opacity, minOpacity), maxOpacity);
    case "remove":
      return (opacity: number) =>
        opacity < minOpacity || opacity > maxOpacity ? null : opacity;
    default:
      return (opacity: number) => opacity;
  }
}

export function createOpacityValueGenerator(min: number, max: number) {
  const delta = max - min;
  return () => delta * Math.random() + min;
}

export function createSizeVariationFilter({
  minSize,
  maxSize,
  elementWidth,
  elementHeight,
  xPadding,
  yPadding,
}: {
  minSize: number;
  maxSize: number;
  elementWidth: number;
  elementHeight: number;
  xPadding: number;
  yPadding: number;
}) {
  const effectiveWidth = elementWidth - xPadding;
  const effectiveHeight = elementHeight - yPadding;
  const deltaSize = maxSize - minSize;

  const fixedSize = () => minSize;
  const randomSize = () => Math.random() * deltaSize + minSize;
  const getSizeFn = deltaSize > 1 ? randomSize : fixedSize;

  return function applyResizeEffect(node: ShapeNode) {
    const size = getSizeFn();
    node.resize(effectiveWidth * size, effectiveHeight * size);
    node.x -= (effectiveWidth * size - elementWidth) * 0.5;
    node.y -= (effectiveHeight * size - elementHeight) * 0.5;
  };
}

export function createRotationVariationFilter({
  minRotation,
  maxRotation,
}: {
  minRotation: number;
  maxRotation: number;
}) {
  const deltaRotation = maxRotation - minRotation;
  const fixedAngle = () => minRotation;
  const randomAngle = () => Math.random() * deltaRotation + minRotation;
  const getAngleFn = deltaRotation > 1 ? randomAngle : fixedAngle;

  return function rotateOnCenterAxis(node: ShapeNode) {
    const { x, y, width, height } = node;
    const angle = getAngleFn();

    if (angle !== 0)
      node.relativeTransform = transformRotateAxis2D(
        angle,
        x,
        y,
        x + width * 0.5,
        y + height * 0.5,
      );
  };
}

export function colorGenerator(colors: RGB[]) {
  if (colors.length === 1) return () => colors[0];
  return () => colors[Math.floor(Math.random() * colors.length)];
}

export function transformRange01(
  [min, max]: [number, number],
  maxValue: number,
) {
  return [min / maxValue, max / maxValue];
}
