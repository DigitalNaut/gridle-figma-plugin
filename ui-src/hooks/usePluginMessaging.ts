import { useEffect } from "react";

import type { PatternDataMessage } from "@common/main";

export function usePluginMessaging(messageHandler: typeof onmessage) {
  const onCreate = (pluginMessage: PatternDataMessage) =>
    parent.postMessage({ pluginMessage }, "*");

  const onClose = () =>
    parent.postMessage({ pluginMessage: { type: "close" } }, "*");

  useEffect(() => {
    onmessage = messageHandler;

    return () => void (onmessage = null);
  }, []);

  return { onCreate, onClose };
}
