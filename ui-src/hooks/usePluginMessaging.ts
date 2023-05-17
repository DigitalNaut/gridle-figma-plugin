import { useEffect } from "react";

export function usePluginMessaging(messageHandler: typeof onmessage) {
  const onCreate = (pluginMessage: GeneratePatternMessage) =>
    parent.postMessage({ pluginMessage }, "*");

  const onClose = () =>
    parent.postMessage({ pluginMessage: { type: "close" } }, "*");

  useEffect(() => {
    onmessage = messageHandler;

    return () => void (onmessage = null);
  }, []);

  return { onCreate, onClose };
}
