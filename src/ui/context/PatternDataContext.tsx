import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { createContext, useState, useMemo, useCallback } from "react";

import type { PatternDataMessage } from "@common";
import { defaultInputValues, toFloat } from "@common";

import type { Preset } from "~/settings";

type PatternDataContext = {
  patternData: PatternDataMessage;
  setPatternData: Dispatch<SetStateAction<PatternDataMessage>>;
  applyDefaultPreset: () => void;
  applyPreset: (preset: Preset) => void;
  elementWidth: number;
  elementHeight: number;
  derivedElementWidth: number;
  derivedElementHeight: number;
};

export const PatternDataContext = createContext<PatternDataContext>({
  patternData: defaultInputValues,
  setPatternData: () => null,
  applyDefaultPreset: () => null,
  applyPreset: () => null,
  elementWidth: 0,
  elementHeight: 0,
  derivedElementWidth: 0,
  derivedElementHeight: 0,
});

export function PatternDataProvider({ children }: PropsWithChildren) {
  const [patternMessage, setPatternMessage] =
    useState<PatternDataMessage>(defaultInputValues);

  const applyDefaultPreset = useCallback(
    () => setPatternMessage(defaultInputValues),
    [],
  );
  const applyPreset = useCallback(
    (value: Preset) =>
      setPatternMessage((prev) => ({
        ...prev,
        ...value,
      })),
    [],
  );

  const elementWidth = useMemo(
    () => patternMessage.frameWidth / patternMessage.columns,
    [patternMessage.frameWidth, patternMessage.columns],
  );
  const elementHeight = useMemo(
    () => patternMessage.frameHeight / patternMessage.rows,
    [patternMessage.frameHeight, patternMessage.rows],
  );
  const derivedElementWidth = useMemo(
    () => toFloat(elementWidth - patternMessage.xPadding),
    [elementWidth, patternMessage.xPadding],
  );
  const derivedElementHeight = useMemo(
    () => toFloat(elementHeight - patternMessage.yPadding),
    [elementHeight, patternMessage.yPadding],
  );

  return (
    <PatternDataContext.Provider
      value={{
        patternData: patternMessage,
        setPatternData: setPatternMessage,
        applyDefaultPreset,
        applyPreset,
        derivedElementWidth,
        derivedElementHeight,
        elementWidth,
        elementHeight,
      }}
    >
      {children}
    </PatternDataContext.Provider>
  );
}
