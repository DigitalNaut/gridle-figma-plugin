import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { createContext, useState, useMemo } from "react";

import type { PatternDataMessage } from "@common";
import { defaultInputValues, toFloat } from "@common";

type PatternMessageContextType = {
  patternMessage: PatternDataMessage;
  setPatternMessage: Dispatch<SetStateAction<PatternDataMessage>>;
  applyDefaultPreset: () => void;
  elementWidth: number;
  elementHeight: number;
  derivedElementWidth: number;
  derivedElementHeight: number;
  loaded: boolean;
  setLoaded: Dispatch<SetStateAction<boolean>>;
};

export const PatternMessageContext = createContext<PatternMessageContextType>({
  patternMessage: defaultInputValues,
  setPatternMessage: () => null,
  applyDefaultPreset: () => null,
  elementWidth: 0,
  elementHeight: 0,
  derivedElementWidth: 0,
  derivedElementHeight: 0,
  loaded: false,
  setLoaded: () => null,
});

export function PatternMessageProvider({ children }: PropsWithChildren) {
  const [loaded, setLoaded] = useState(false);
  const [patternMessage, setPatternMessage] =
    useState<PatternDataMessage>(defaultInputValues);

  const applyDefaultPreset = () => setPatternMessage(defaultInputValues);

  const elementWidth = useMemo(
    () => patternMessage.frameWidth / patternMessage.columns,
    [patternMessage.frameWidth, patternMessage.columns],
  );
  const elementHeight = useMemo(
    () => patternMessage.frameHeight / patternMessage.rows,
    [patternMessage.frameHeight, patternMessage.rows],
  );
  const derivedElementWidth = toFloat(elementWidth - patternMessage.xPadding);
  const derivedElementHeight = toFloat(elementHeight - patternMessage.yPadding);

  return (
    <PatternMessageContext.Provider
      value={{
        patternMessage,
        setPatternMessage,
        applyDefaultPreset,
        derivedElementWidth,
        derivedElementHeight,
        elementWidth,
        elementHeight,
        loaded,
        setLoaded,
      }}
    >
      {children}
    </PatternMessageContext.Provider>
  );
}
