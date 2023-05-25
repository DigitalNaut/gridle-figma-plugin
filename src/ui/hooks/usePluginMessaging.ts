import { useEffect, useState } from "react";

import type { PatternDataMessage } from "@common";
import { messageTypes } from "@common";

export function usePluginMessaging(messageHandler: typeof onmessage) {
  const [loaded, setLoaded] = useState(false);

  const startGeneration = (patternData: PatternDataMessage) =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.generationStart, patternData } },
      "*",
    );

  const stopGeneration = () => {
    parent.postMessage(
      { pluginMessage: { type: messageTypes.generationStop } },
      "*",
    );
  };

  const abortGeneration = () => {
    parent.postMessage(
      { pluginMessage: { type: messageTypes.generationAbort } },
      "*",
    );
  };

  const savePreset = (preset: PatternDataMessage) =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.savePreset, preset } },
      "*",
    );

  const clearPreset = () =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.clearPreset } },
      "*",
    );

  const loadPreset = (presetName?: string) =>
    parent.postMessage(
      { pluginMessage: { type: messageTypes.loadPreset, presetName } },
      "*",
    );

  const onClose = () =>
    parent.postMessage({ pluginMessage: { type: messageTypes.close } }, "*");

  const onLoad = () =>
    parent.postMessage({ pluginMessage: { type: messageTypes.uiLoaded } }, "*");

  useEffect(() => {
    onmessage = messageHandler;

    return () => void (onmessage = null);
  }, [messageHandler]);

  useEffect(() => {
    if (loaded) return;
    loadPreset();
    onLoad();
    setLoaded(true);
  }, [loaded]);

  return {
    stopGeneration,
    abortGeneration,
    startGeneration,
    savePreset,
    loadPreset,
    clearPreset,
    onClose,
  };
}
