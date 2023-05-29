import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { useCallback, createContext, useState, useEffect } from "react";

import type { ElementSelection, PatternDataMessage } from "@common";
import { messageTypes, sleep } from "@common";

import { AppState } from "~/settings";
import { usePatternDataContext } from "~/hooks/usePatternData";
import { useApplicationState } from "~/hooks/useApplicationState";

export const pluginMessenger = {
  startGeneration: (patternData: PatternDataMessage) =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.generationStart, patternData } },
      "*",
    ),

  stopGeneration: () => {
    parent.postMessage(
      { pluginMessage: { type: messageTypes.generationStop } },
      "*",
    );
  },

  abortGeneration: () => {
    parent.postMessage(
      { pluginMessage: { type: messageTypes.generationAbort } },
      "*",
    );
  },

  savePreset: (preset: PatternDataMessage) =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.savePreset, preset } },
      "*",
    ),

  clearPreset: () =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.clearPreset } },
      "*",
    ),

  loadPreset: (presetName?: string) =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.loadPreset, presetName } },
      "*",
    ),

  onClose: () =>
    parent.postMessage({ pluginMessage: { type: messageTypes.close } }, "*"),

  onLoad: () =>
    parent.postMessage({ pluginMessage: { type: messageTypes.uiLoaded } }, "*"),
};

type PluginMessagingContextType = {
  progress: {
    percentProgress: number;
    timeElapsed: number;
  };
  setProgress: Dispatch<
    SetStateAction<{
      percentProgress: number;
      timeElapsed: number;
    }>
  >;
  selectionType: ElementSelection;
  pluginMessenger: typeof pluginMessenger;
  messageHandler: typeof onmessage;
};

export const PluginMessagingContext = createContext<PluginMessagingContextType>(
  {
    progress: {
      percentProgress: 0,
      timeElapsed: 0,
    },
    setProgress: () => null,
    selectionType: { type: "none" },
    pluginMessenger,
    messageHandler: () => null,
  },
);

export function PluginMessagingProvider({ children }: PropsWithChildren) {
  const { loaded, setLoaded, setAppState, setError } = useApplicationState();
  const { setPatternData: setPatternMessage } = usePatternDataContext();

  const [progress, setProgress] = useState({
    percentProgress: 0,
    timeElapsed: 0,
  });
  const [selectionType, setSelectionType] = useState<ElementSelection>({
    type: "none",
  });

  const messageHandler = useCallback(
    async ({ data: { pluginMessage } }: MessageEvent) => {
      switch (pluginMessage?.type) {
        case messageTypes.generationProgress:
          setProgress(pluginMessage.data);
          break;

        case messageTypes.generationComplete:
          setAppState(AppState.COMPLETE);
          await sleep(300);
          setAppState(AppState.IDLE);
          break;

        case messageTypes.generationStarted:
          setAppState(AppState.GENERATING);
          break;

        case messageTypes.generationStopped:
          setAppState(AppState.STOPPED);
          await sleep(1500);
          setAppState(AppState.IDLE);
          break;

        case messageTypes.generationError:
          setAppState(AppState.ERROR);
          setError(pluginMessage.error);
          break;

        case messageTypes.presetLoaded:
          setPatternMessage(pluginMessage.data.preset);
          break;

        case messageTypes.selectionChanged:
          setSelectionType(pluginMessage.data);
          break;

        default:
          break;
      }
    },
    [setPatternMessage, setAppState, setError],
  );

  useEffect(() => {
    if (loaded) return;

    pluginMessenger.loadPreset();
    pluginMessenger.onLoad();

    setLoaded(true);
  }, [loaded, setLoaded]);

  return (
    <PluginMessagingContext.Provider
      value={{
        pluginMessenger,
        progress,
        setProgress,
        selectionType,
        messageHandler,
      }}
    >
      {children}
    </PluginMessagingContext.Provider>
  );
}
