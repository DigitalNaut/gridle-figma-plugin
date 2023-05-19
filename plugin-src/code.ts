import { messageTypes } from "@common/index";

import {
  postGenerationStarted,
  postGenerationCompleted,
  postGenerationStopped,
  postGenerationError,
  presetLoaded,
} from "./messages";
import {  DEFAULT_WINDOW_OPTIONS } from "./constants";
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  clearSettingsFromStorage,
} from "./storage";
import { generatePattern, abortGeneration, stopGeneration } from "./generator";

figma.showUI(__html__, DEFAULT_WINDOW_OPTIONS);

figma.ui.onmessage = (msg) => {
  const { type } = msg || {};

  switch (type) {
    case messageTypes.generationStart:
      postGenerationStarted();

      generatePattern(msg.patternData)
        .then((result) => {
          if (result.stopFlag) postGenerationStopped(result);
          else postGenerationCompleted(result);
        })
        .catch((error) => {
          if (error instanceof Error) postGenerationError(error.message);
          else postGenerationError("Unknown error");

          figma.notify("Error generating pattern");
          console.error(error);
        });
      break;

    case messageTypes.generationAbort:
      console.log("Aborting...");
      abortGeneration();
      break;

    case messageTypes.generationStop:
      console.log("Stopping...");
      stopGeneration();
      break;

    case messageTypes.UIStarted:
      const preset = loadSettingsFromStorage();
      if (preset) presetLoaded(preset);
      break;

    case messageTypes.savePreset:
      saveSettingsToStorage(msg.preset);
      figma.notify("Current settings saved");
      break;

    case messageTypes.clearPreset:
      clearSettingsFromStorage();
      figma.notify("Saved settings deleted");
      break;

    case messageTypes.close:
      figma.closePlugin();
      break;

    default:
      break;
  }
};
