import type { Dispatch, SetStateAction } from "react";

import type { PatternDataMessage } from "@common";

export type OnRearrangeColors = (fromIndex: number, toIndex: number) => void;
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
      colors: prev.colors.concat(prev.colors[prev.colors.length - 1]),
    }));

  const handleRearrangeColors: OnRearrangeColors = (fromIndex, toIndex) => {
    const colors = [...state.colors];
    const [color] = colors.splice(fromIndex, 1);
    colors.splice(toIndex, 0, color);

    setState((prev) => ({
      ...prev,
      colors,
    }));
  };

  return {
    handleColorChange,
    handleRemoveColor,
    handleAddColor,
    handleRearrangeColors,
  };
}
