import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

import { useCallback, createContext, useState, useEffect } from "react";

import type { ElementSelection, PatternDataMessage } from "@common";
import type { Preset } from "~/settings";
import { messageTypes, sleep } from "@common";
import { AppState } from "~/settings";
import { usePatternMessageContext } from "~/hooks/usePatternMessage";

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
  loaded: boolean;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  error?: string;
  setError: Dispatch<SetStateAction<string | undefined>>;
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
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  selectionType: ElementSelection;
  pluginMessenger: typeof pluginMessenger;
  applyPreset: (preset: Preset) => void;
  messageHandler: typeof onmessage;
};

export const PluginMessagingContext = createContext<PluginMessagingContextType>(
  {
    loaded: false,
    setLoaded: () => null,
    error: undefined,
    setError: () => null,
    progress: {
      percentProgress: 0,
      timeElapsed: 0,
    },
    setProgress: () => null,
    appState: AppState.IDLE,
    setAppState: () => null,
    selectionType: { type: "none" },
    pluginMessenger,
    applyPreset: () => null,
    messageHandler: () => null,
  },
);

export function PluginMessagingProvider({ children }: PropsWithChildren) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const { setPatternMessage } = usePatternMessageContext();

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState({
    percentProgress: 0,
    timeElapsed: 0,
  });
  const [selectionType, setSelectionType] = useState<ElementSelection>({
    type: "none",
  });
  const applyPreset = (value: Preset) =>
    setPatternMessage((prev) => ({
      ...prev,
      ...value,
    }));

  const messageHandler = useCallback(
    async ({ data: { pluginMessage } }: MessageEvent) => {
      console.log("Plugin message received:", pluginMessage);

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
    [setPatternMessage],
  );

  useEffect(() => {
    if (loaded) return;

    pluginMessenger.loadPreset();
    pluginMessenger.onLoad();

    setLoaded(true);
  }, [loaded]);

  return (
    <PluginMessagingContext.Provider
      value={{
        loaded,
        setLoaded,
        pluginMessenger,
        error,
        setError,
        progress,
        setProgress,
        appState,
        setAppState,
        selectionType,
        applyPreset,
        messageHandler,
      }}
    >
      {children}
    </PluginMessagingContext.Provider>
  );
}
