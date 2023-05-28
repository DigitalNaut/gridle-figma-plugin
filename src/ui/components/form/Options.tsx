import {
  PatternDataMessage,
  verticalFadeModes,
  noiseModes,
  toFloat,
  opacityThresholdModes,
} from "@common";

import { CollapsibleSubsection } from "~/components/Layout";
import ButtonSelect from "~/components/ButtonSelect";
import Input from "~/components/Input";
import Select from "~/components/Select";
import { useBasicInputs } from "~/hooks/useUserInputs";
import { usePatternMessage } from "~/hooks/usePatternMessage";

export function OptionsSection({
  isSectionOpen,
  handleSectionToggle,
}: {
  isSectionOpen: boolean;
  handleSectionToggle: () => void;
}) {
  const { patternMessage, setPatternMessage } = usePatternMessage();
  const { handleStringInputChange, handleFloatInputChange } =
    useBasicInputs(setPatternMessage);

  return (
    <CollapsibleSubsection
      id="options"
      title="Options"
      isOpen={isSectionOpen}
      onToggle={handleSectionToggle}
    >
      <ButtonSelect<PatternDataMessage, string, typeof verticalFadeModes>
        id="verticalFadeModeButtonSelect"
        label="Vertical fade:"
        name="verticalFadeMode"
        value={patternMessage.verticalFadeMode}
        onClick={handleStringInputChange}
        options={[
          {
            value: "ascending",
            optionLabel: (
              <i className="fa-solid fa-lg fa-arrow-up-short-wide"></i>
            ),
          },
          {
            value: "descending",
            optionLabel: (
              <i className="fa-solid fa-lg fa-arrow-down-wide-short"></i>
            ),
          },
          {
            value: "none",
            optionLabel: <i className="fa-solid fa-lg fa-ban"></i>,
          },
        ]}
        title="Shape of the elements."
      />
      <ButtonSelect<PatternDataMessage, string, typeof noiseModes>
        id="noiseModeSelect"
        label="Noise mode:"
        name="noiseMode"
        value={patternMessage.noiseMode}
        onClick={handleStringInputChange}
        options={[
          {
            value: "ascending",
            optionLabel: (
              <i className="fa-solid fa-lg fa-arrow-down-wide-short"></i>
            ),
          },
          {
            value: "descending",
            optionLabel: (
              <i className="fa-solid fa-lg fa-arrow-up-short-wide"></i>
            ),
          },
          {
            value: "uniform",
            optionLabel: <i className="fa-solid fa-lg fa-bars"></i>,
          },
          {
            value: "none",
            optionLabel: <i className="fa-solid fa-lg fa-ban"></i>,
          },
        ]}
        title="Shape of the elements."
      />
      {patternMessage.noiseMode !== "none" && (
        <Input<PatternDataMessage, number>
          labelStyle="pl-4"
          label="Noise amount"
          id="verticalCountInput"
          name="noiseAmount"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={toFloat(patternMessage.noiseAmount)}
          onChange={handleFloatInputChange}
          title="Number of elements to create vertically."
        />
      )}
      <Select<PatternDataMessage, string>
        name="opacityThresholdMode"
        options={opacityThresholdModes}
        label="Outside opacity range:"
        id="opacityThresholdModeSelect"
        value={patternMessage.opacityThresholdMode}
        onChange={handleStringInputChange}
        title="How to handle elements with opacity value below the threshold."
      />
    </CollapsibleSubsection>
  );
}
