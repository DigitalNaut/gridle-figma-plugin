import type { ElementSelection, PatternDataMessage } from "@common";
import { toPercentage, formatSeconds, messageTypes } from "@common";

import type { Progress } from "./generator/generator";

export function postGenerationStarted() {
  figma.ui.postMessage({
    type: messageTypes.generationStarted,
    time: Date.now(),
  });
}

export function postGenerationCompleted(data: Progress) {
  const timeElapsedSeconds = formatSeconds(data.timeElapsed);
  const messageLog = `Pattern generated in ${timeElapsedSeconds}s`;

  figma.notify(messageLog);
  console.log(messageLog);

  figma.ui.postMessage({ type: messageTypes.generationComplete, data });
}

export function postGenerationProgress(data: Omit<Progress, "status">) {
  figma.ui.postMessage({
    type: messageTypes.generationProgress,
    data,
  });
}

export function postGenerationError(error: string) {
  figma.ui.postMessage({ type: messageTypes.generationError, error });
}

export function postSelectionChanged(data: ElementSelection) {
  figma.ui.postMessage({
    type: messageTypes.selectionChanged,
    data,
  });
}

export function postGenerationStopped(data: Progress) {
  const { percentProgress, timeElapsed } = data;

  const messageLog = `Pattern generation halted at ${toPercentage(
    percentProgress,
  )} in ${formatSeconds(timeElapsed)}s. Reason: ${
    data.status ?? "not specified"
  }`;

  figma.notify(messageLog);
  console.log(messageLog);

  figma.ui.postMessage({ type: messageTypes.generationStopped, data });
}

export function presetLoaded(preset: PatternDataMessage) {
  figma.ui.postMessage({
    type: messageTypes.presetLoaded,
    data: { preset },
  });
}
