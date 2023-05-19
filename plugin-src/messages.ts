import { Progress, toPercent, formatSeconds } from "@common/index";

export function postGenerationStart() {
  figma.ui.postMessage({ type: "generation-started", time: Date.now() });
}

export function postGenerationCompleted(data: Progress) {
  const timeElapsedSeconds = formatSeconds(data.timeElapsed);
  const messageLog = `Pattern generated in ${timeElapsedSeconds}s`;

  figma.notify(messageLog);
  console.log(messageLog);

  figma.ui.postMessage({ type: "generation-complete", data });
}

export function postGenerationProgress(data: Omit<Progress, "stopFlag">) {
  figma.ui.postMessage({
    type: "generation-progress",
    data,
  });
}

export function postGenerationError(error: string) {
  figma.ui.postMessage({ type: "generation-error", error });
}

export function postGenerationStopped(data: Progress) {
  const { percentage, timeElapsed, stopFlag: stopCode } = data;

  const messageLog = `Pattern generation ${stopCode} at ${toPercent(
    percentage
  )} in ${formatSeconds(timeElapsed)}s`;

  figma.notify(messageLog);
  console.log(messageLog);

  figma.ui.postMessage({ type: "generation-stopped", data });
}
