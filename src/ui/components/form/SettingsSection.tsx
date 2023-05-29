import { useState } from "react";

import type { GlobalPresets } from "~/settings";
import { globalPresets } from "~/settings";
import Button from "~/components/Button";
import Select from "~/components/Select";
import { CollapsibleSubsection } from "~/components/Layout";
import { usePluginMessagingContext } from "~/hooks/usePluginMessaging";
import { usePatternDataContext } from "~/hooks/usePatternData";

export function SettingsSection({
  isSectionOpen,
  handleSectionToggle,
}: {
  isSectionOpen: boolean;
  handleSectionToggle: () => void;
}) {
  const {
    pluginMessenger: { savePreset, clearPreset, loadPreset },
  } = usePluginMessagingContext();
  const { patternData: patternMessage, applyDefaultPreset, applyPreset } =
    usePatternDataContext();
  const [availablePresets] = useState<GlobalPresets>(globalPresets);

  return (
    <CollapsibleSubsection
      id="settings"
      title="Settings"
      isOpen={isSectionOpen}
      onToggle={handleSectionToggle}
    >
      <div className="flex flex-col items-center">
        <div className="flex w-full">
          <span className="grow text-sm">Settings</span>
        </div>
        <span className="flex w-full justify-evenly">
          <Button
            appearance="plainStyle"
            onClick={() => savePreset(patternMessage)}
          >
            <i className="fa-solid fa-floppy-disk"></i> Save
          </Button>
          <Button appearance="plainStyle" onClick={clearPreset}>
            <i className="fa-solid fa-trash"></i> Delete
          </Button>
          <Button appearance="plainStyle" onClick={() => loadPreset()}>
            <i className="fa-solid fa-rotate"></i> Reload
          </Button>
        </span>
      </div>
      <Button appearance="plainStyle" onClick={applyDefaultPreset}>
        <i className="fa-solid fa-rotate-left"></i> Reset to default
      </Button>
      <Select
        prompt="Select a preset"
        options={Object.keys(globalPresets)}
        id="presetSelect"
        onChange={({ currentTarget }) =>
          applyPreset(availablePresets[currentTarget.value])
        }
        title="Predefined settings."
      />
    </CollapsibleSubsection>
  );
}
