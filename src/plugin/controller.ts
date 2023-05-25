import type { ElementSelectionTypes } from "@common";
import { messageTypes, elementSelectionTypes } from "@common";

import {
  postGenerationStarted,
  postGenerationCompleted,
  postGenerationStopped,
  postGenerationError,
  presetLoaded,
  postSelectionChanged,
} from "./messages";
import { DEFAULT_WINDOW_OPTIONS } from "./settings";
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  clearSettingsInStorage,
} from "./utils/storage";
import Generator from "./generator/generator";
import { isSupportedNode } from "./types";

figma.showUI(__html__, DEFAULT_WINDOW_OPTIONS);

const generator = new Generator();

function selectionChangeHandler() {
  const { selection } = figma.currentPage;
  let selectionType: ElementSelectionTypes;
  if (selection.length === 0) selectionType = elementSelectionTypes.none;
  else if (selection.length === 1) {
    const [node] = selection;
    if (isSupportedNode(node)) selectionType = elementSelectionTypes.supported;
    else selectionType = elementSelectionTypes.notSupported;
  } else selectionType = elementSelectionTypes.multiple;

  postSelectionChanged({
    type: selectionType,
    element: selection[0]?.type,
  });
}

figma.on("selectionchange", selectionChangeHandler);

figma.ui.onmessage = async (msg) => {
  const { type } = msg || {};

  switch (type) {
    case messageTypes.generationStart:
      figma.off("selectionchange", selectionChangeHandler);
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
        figma.on("selectionchange", selectionChangeHandler);
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

    case messageTypes.savePreset:
      saveSettingsToStorage(msg.preset);
      figma.notify("Current settings saved");
      break;

    case messageTypes.loadPreset: {
      const preset = loadSettingsFromStorage();
      if (preset) presetLoaded(preset);
      break;
    }

    case messageTypes.uiLoaded:
      selectionChangeHandler();
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
