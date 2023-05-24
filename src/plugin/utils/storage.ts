import type { PatternDataMessage } from "@common";
import { patternDataMessageSchema } from "@common";

import { SAVED_SETTINGS_KEY } from "~/settings";

export function loadSettingsFromStorage(presetKey?: string) {
  const preset = figma.root.getPluginData(presetKey ?? SAVED_SETTINGS_KEY);

  if (preset) {
    console.log("Loading settings...");
    const loadedPreset = JSON.parse(preset, (_key, value) => value ?? null);
    const validatedPreset = patternDataMessageSchema.safeParse(loadedPreset);

    if (validatedPreset.success) {
      console.log("Settings loaded");
      figma.notify("Settings loaded.");

      return validatedPreset.data;
    } else {
      console.error("Validation error, resetting storage");
      figma.notify("Error loading settings. Resetting.");

      clearSettingsInStorage();
      return null;
    }
  }

  console.log("No saved settings found");
  return null;
}

export function saveSettingsToStorage(preset: PatternDataMessage) {
  figma.root.setPluginData(SAVED_SETTINGS_KEY, JSON.stringify(preset));
  console.log("Settings saved");
}

export function clearSettingsInStorage() {
  figma.root.setPluginData(SAVED_SETTINGS_KEY, "");
  console.log("Saved settings cleared");
}
