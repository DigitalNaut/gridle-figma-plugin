import type { PatternDataMessage } from "@common/index";

import { SAVED_SETTINGS_KEY } from "./constants";

export function loadSettingsFromStorage() {
  const preset = figma.root.getPluginData(SAVED_SETTINGS_KEY);

  if (preset) {
    console.log("Saved settings loaded");
    return JSON.parse(preset, (key, value) => value ?? null);
  }

  console.log("No saved settings found");
  return null;
}

export function saveSettingsToStorage(preset: PatternDataMessage) {
  figma.root.setPluginData(SAVED_SETTINGS_KEY, JSON.stringify(preset));
  console.log("Settings saved");
}

export function clearSettingsFromStorage() {
  figma.root.setPluginData(SAVED_SETTINGS_KEY, "");
  console.log("Saved settings cleared");
}
