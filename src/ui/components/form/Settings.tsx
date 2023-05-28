import { CollapsibleSubsection } from "~/components/Layout";
import { Preset, PresetRecord, globalPresets } from "~/settings";
import Button from "~/components/Button";
import Select from "~/components/Select";
import { usePluginMessaging } from "~/hooks/usePluginMessaging";
import { usePatternMessage } from "~/hooks/usePatternMessage";

export function SettingsSection({
  isSectionOpen,
  handleSectionToggle,
  handleMessages,
  availablePresets,
  applyPreset,
}: {
  isSectionOpen: boolean;
  handleSectionToggle: () => void;
  handleMessages: typeof onmessage;
  availablePresets: PresetRecord;
  applyPreset: (value: Preset) => void;
}) {
  const { savePreset, clearPreset, loadPreset } =
    usePluginMessaging(handleMessages);
  const { patternMessage, applyDefaultPreset } = usePatternMessage();

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
