export function useAppEvents() {
  const onCreate = (pluginMessage: GeneratePatternMessage) =>
    parent.postMessage({ pluginMessage }, "*");

  const onClose = () =>
    parent.postMessage({ pluginMessage: { type: "close" } }, "*");

  return { onCreate, onClose };
}
