import type { Dispatch, SetStateAction } from "react";

import type { PatternDataMessage } from "@common";
import { clamp } from "@common";

export type OnMoveColor = (
  colorA: number,
  colorB: number,
  position: "before" | "after",
) => void;
export type OnSwapColors = (colorA: number, colorB: number) => void;
export type OnChangeColor = (color: string, colorIndex: number) => void;
export type OnRemoveColor = (colorIndex: number) => void;

export function useColorHandlers(
  setState: Dispatch<SetStateAction<PatternDataMessage>>,
  state: PatternDataMessage,
) {
  const handleColorChange: OnChangeColor = (newColor, colorIndex) =>
    setState((prev) => ({
      ...prev,
      colors: state.colors.map((color, i) =>
        i === colorIndex ? newColor : color,
      ),
    }));

  const handleRemoveColor: OnRemoveColor = (colorIndex) =>
    setState((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== colorIndex),
    }));

  const handleAddColor = () =>
    setState((prev) => ({
      ...prev,
      colors: prev.colors.concat(
        prev.colors[prev.colors.length - 1] || "#ffffff",
      ),
    }));

  const handleSwapColors: OnSwapColors = (colorA, colorB) => {
    const colors = [...state.colors];

    [colors[colorA], colors[colorB]] = [colors[colorB], colors[colorA]];

    setState((prev) => ({
      ...prev,
      colors,
    }));
  };

  const handleMoveColor: OnMoveColor = (fromIndex, toIndex, position) => {
    const toAdjustedIndex = clamp(
      toIndex + (position === "after" ? 1 : 0),
      0,
      state.colors.length,
    );

    if (fromIndex === toAdjustedIndex) return;

    const colors = [...state.colors];

    const color = colors[fromIndex];
    colors.splice(toAdjustedIndex, 0, color);
    colors.splice(fromIndex + +(fromIndex > toAdjustedIndex), 1);

    setState((prev) => ({
      ...prev,
      colors,
    }));
  };

  return {
    handleColorChange,
    handleRemoveColor,
    handleAddColor,
    handleSwapColors,
    handleMoveColor,
  };
}
