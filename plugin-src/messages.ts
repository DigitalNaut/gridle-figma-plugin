export function postGenerationStart() {
  figma.ui.postMessage({ type: "generation-started", time: Date.now() });
}

export function postGenerationCompleted() {
  figma.ui.postMessage({ type: "generation-complete", time: Date.now() });
}

export function postGenerationProgress(progress: number) {
  figma.ui.postMessage({ type: "generation-progress", progress });
}

export function postGenerationError(error: string) {
  figma.ui.postMessage({ type: "generation-error", error });
}

export function postGenerationAborted() {
  figma.ui.postMessage({ type: "generation-aborted" });
}
