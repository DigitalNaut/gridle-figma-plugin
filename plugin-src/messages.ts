import {
  Progress,
  toPercent,
  formatSeconds,
  messageTypes,
  PatternDataMessage,
} from "@common/index";

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

export function postGenerationProgress(data: Omit<Progress, "stopFlag">) {
  figma.ui.postMessage({
    type: messageTypes.generationProgress,
    data,
  });
}

export function postGenerationError(error: string) {
  figma.ui.postMessage({ type: messageTypes.generationError, error });
}

export function postGenerationStopped(data: Progress) {
  const { percentage, timeElapsed, stopFlag: stopCode } = data;

  const messageLog = `Pattern generation ${stopCode} at ${toPercent(
    percentage
  )} in ${formatSeconds(timeElapsed)}s`;

  figma.notify(messageLog);
  console.log(messageLog);

  figma.ui.postMessage({ type: messageTypes.generationStopped, data });
}

export function presetLoaded(preset: PatternDataMessage) {
  figma.ui.postMessage({
    type: messageTypes.presetLoaded,
    preset,
  });
}
