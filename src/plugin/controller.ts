import { messageTypes } from "@common/index";

import {
  postGenerationStarted,
  postGenerationCompleted,
  postGenerationStopped,
  postGenerationError,
  presetLoaded,
} from "./messages";
import { DEFAULT_WINDOW_OPTIONS } from "./settings";
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  clearSettingsInStorage,
} from "./utils/storage";
import Generator from "./generator/generator";

figma.showUI(__html__, DEFAULT_WINDOW_OPTIONS);

const generator = new Generator();

figma.ui.onmessage = async (msg) => {
  const { type } = msg || {};

  switch (type) {
    case messageTypes.generationStart:
      generator.reset();
      postGenerationStarted();

      try {
        const result = await generator.start(msg.patternData);

        if (result.status !== "completed") postGenerationStopped(result);
        else postGenerationCompleted(result);
      } catch (error) {
        if (error instanceof Error) postGenerationError(error.message);
        else postGenerationError("Unknown error");

        figma.notify("Error generating pattern");
        console.error(error);
      } finally {
        generator.reset();
      }
      break;

    case messageTypes.generationAbort:
      console.log("Aborting...");
      generator.abort();
      break;

    case messageTypes.generationStop:
      console.log("Stopping...");
      generator.stop();
      break;

    case messageTypes.UIStarted: {
      const preset = loadSettingsFromStorage();
      if (preset) presetLoaded(preset);
      break;
    }

    case messageTypes.savePreset:
      saveSettingsToStorage(msg.preset);
      figma.notify("Current settings saved");
      break;

    case messageTypes.clearPreset:
      clearSettingsInStorage();
      figma.notify("Saved settings deleted");
      break;

    case messageTypes.close:
      figma.closePlugin();
      break;

    default:
      break;
  }
};
