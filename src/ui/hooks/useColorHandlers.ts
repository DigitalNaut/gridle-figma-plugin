import type { Dispatch, SetStateAction } from "react";

import type { PatternDataMessage } from "@common";

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
    const colors = [...state.colors];

    if (position === "before") {
      colors.splice(toIndex, 0, colors.splice(fromIndex, 1)[0]);
    } else {
      colors.splice(toIndex + 1, 0, colors.splice(fromIndex, 1)[0]);
    }

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
