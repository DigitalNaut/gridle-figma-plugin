import type { GeneratePatternMessage } from "@common/index";
import { Dispatch, SetStateAction } from "react";

export function useColorHandlers(
  setState: Dispatch<SetStateAction<GeneratePatternMessage>>,
  state: GeneratePatternMessage
) {
  const handleColorChange = (newColor: string, colorIndex: number) =>
    setState((prev) => ({
      ...prev,
      colors: state.colors.map((color, i) =>
        i === colorIndex ? newColor : color
      ),
    }));

  const handleRemoveColor = (colorIndex: number) =>
    setState((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== colorIndex),
    }));

  const handleAddColor = () =>
    setState((prev) => ({
      ...prev,
      colors: prev.colors.concat(prev.colors[prev.colors.length - 1]),
    }));

  return { handleColorChange, handleRemoveColor, handleAddColor };
}
