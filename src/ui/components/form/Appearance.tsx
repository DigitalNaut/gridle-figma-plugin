import {
  PatternDataMessage,
  supportedShapes,
  elementSelectionTypes,
  toFloat,
  colorGenerationModes,
  ColorGenerationMode,
  ROTATION_RANGE_LIMITS,
  OPACITY_RANGE_LIMITS,
  SIZE_RANGE_LIMITS,
  ElementSelection,
} from "@common";

import { CollapsibleSubsection } from "~/components/Layout";
import { Preset, colorPresets } from "~/settings";
import ButtonSelect from "~/components/ButtonSelect";
import InlineNotice from "~/components/InlineWarning";
import Input from "~/components/Input";
import MultiColorPicker from "~/components/MultiColorPicker";
import MultiRangeSlider from "~/components/MultiRangeSlider";
import Select from "~/components/Select";
import { useBasicInputs } from "~/hooks/useUserInputs";
import { useColorHandlers } from "~/hooks/useColorHandlers";
import { usePatternMessage } from "~/hooks/usePatternMessage";

export function AppearanceSection({
  isSectionOpen,
  handleSectionToggle,
  selectionType,
  applyPreset,
}: {
  isSectionOpen: boolean;
  handleSectionToggle: () => void;
  selectionType: ElementSelection;
  applyPreset: (value: Preset) => void;
}) {
  const { patternMessage, setPatternMessage, derivedElementWidth } =
    usePatternMessage();
  const {
    handleStringInputChange,
    handleFloatInputChange,
    handleIntegerInputChange,
  } = useBasicInputs(setPatternMessage);
  const {
    handleColorChange,
    handleAddColor,
    handleRemoveColor,
    handleSwapColors,
    handleMoveColor,
  } = useColorHandlers(setPatternMessage, patternMessage);
  const handleOpacityRangeSliderChange = (opacityRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, opacityRange }));

  const handleSizeRangeSliderChange = (sizeRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, sizeRange }));
  const handleRotationRangeSliderChange = (rotationRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, rotationRange }));

  return (
    <CollapsibleSubsection
      isOpen={isSectionOpen}
      id="appearance"
      title={`Appearance`}
      onToggle={handleSectionToggle}
    >
      <ButtonSelect<PatternDataMessage, string, typeof supportedShapes>
        id="shapeSelect"
        label="Shape:"
        name="shape"
        value={patternMessage.shape}
        onClick={handleStringInputChange}
        options={[
          {
            value: "square",
            optionLabel: <i className="fa-solid fa-lg fa-square"></i>,
          },
          {
            value: "circle",
            optionLabel: <i className="fa-solid fa-lg fa-circle"></i>,
          },
          {
            value: "star",
            optionLabel: <i className="fa-solid fa-lg fa-star"></i>,
          },
          {
            value: "polygon",
            optionLabel: (
              <div className="-rotate-90 transform">
                <i className="fa-solid fa-lg fa-play"></i>
              </div>
            ),
          },
          {
            value: "selection",
            optionLabel: <i className="fa-solid fa-lg fa-arrow-pointer"></i>,
          },
        ]}
        title="Shape of the elements."
      />
      {patternMessage.shape === "selection" &&
        (selectionType.type === elementSelectionTypes.supported ? (
          <InlineNotice info>
            {`Selected: ${selectionType.element}`}
          </InlineNotice>
        ) : (
          <InlineNotice>
            {selectionType.type === elementSelectionTypes.none && (
              <span title="Please select an element to use for the pattern.">
                No selection
              </span>
            )}
            {selectionType.type === elementSelectionTypes.multiple && (
              <span title="Please select a single element.">
                Multiple selection not supported
              </span>
            )}
            {selectionType.type === elementSelectionTypes.notSupported && (
              <details title="Please select a valid element.">
                <summary className="cursor-pointer">
                  <span>{`Selection not supported: ${selectionType.element}`}</span>
                </summary>
                <div className="mb-1 mt-0 bg-white/60 py-1 pl-2 text-zinc-800">
                  <span>A selection can be:</span>
                  <ul className="list-inside list-disc pl-2">
                    <li>
                      <span
                        className="group relative border-b-2 border-dotted border-zinc-800/75"
                        title=""
                      >
                        A shape
                        <span
                          className="invisible absolute -right-2 top-1/2 z-[1] w-max -translate-y-1/2 translate-x-full transform rounded-md bg-white/90 p-2 px-1 text-zinc-800 opacity-0 shadow-lg transition content-['']
                                  after:absolute after:right-full after:top-1/2 after:-mt-1 after:border-4 after:border-solid after:border-y-transparent after:border-l-transparent after:border-r-white/90
                                  group-hover:visible group-hover:opacity-100"
                        >
                          <ul className="list-outside list-['-'] pl-2">
                            <li>Rectangle</li>
                            <li>Ellipse</li>
                            <li>Line</li>
                            <li>Star</li>
                            <li>Polygon</li>
                            <li>Vector</li>
                          </ul>
                        </span>
                      </span>
                    </li>
                    <li>A frame</li>
                    <li>A component</li>
                    <li>A component set</li>
                    <li>A text element</li>
                  </ul>
                </div>
              </details>
            )}
          </InlineNotice>
        ))}
      {patternMessage.shape === "polygon" && (
        <Input<PatternDataMessage, number>
          labelStyle="pl-4"
          label="Point count"
          id="sidesInput"
          name="pointCount"
          type="number"
          min={3}
          max={10}
          maxLength={2}
          value={patternMessage.pointCount}
          onChange={handleFloatInputChange}
          title="Number of points for the polygon shape."
        />
      )}
      {["circle", "selection"].includes(patternMessage.shape) || (
        <Input<PatternDataMessage, number>
          labelStyle="pl-4"
          label="Corner radius"
          id="cornerRadiusInput"
          name="cornerRadius"
          type="number"
          min={0}
          max={derivedElementWidth * 0.5}
          maxLength={3}
          value={toFloat(patternMessage.cornerRadius)}
          onChange={handleFloatInputChange}
          title="Corner radius of the elements."
        />
      )}
      <MultiColorPicker
        label={`Colors (${patternMessage.colors.length})`}
        colors={patternMessage.colors}
        onAddColor={handleAddColor}
        onChangeColor={handleColorChange}
        onRemoveColor={handleRemoveColor}
        onMoveColor={handleMoveColor}
        onSwapColors={handleSwapColors}
      />
      {patternMessage.shape !== "selection" &&
        patternMessage.colors.length < 1 && (
          <InlineNotice>No colors; the pattern will be invisible</InlineNotice>
        )}
      <Select
        prompt="Select a color preset"
        options={Object.keys(colorPresets)}
        id="colorPresetSelect"
        onChange={({ currentTarget }) =>
          applyPreset(colorPresets[currentTarget.value])
        }
        title="Predefined colors."
      />
      <Select
        options={colorGenerationModes}
        id="colorGenerationModeSelect"
        label="Color mode:"
        value={patternMessage.colorGenerationMode}
        onChange={({ currentTarget }) =>
          setPatternMessage((prev) => ({
            ...prev,
            colorGenerationMode: currentTarget.value as ColorGenerationMode,
          }))
        }
        title="Predefined colors."
      />
      {patternMessage.colorGenerationMode === "cycle" && (
        <Input<PatternDataMessage, number>
          labelStyle="pl-4"
          label="Even row color offset"
          id="evenRowOffsetInput"
          name="rowColorOffset"
          type="number"
          min={0}
          max={patternMessage.colors.length}
          maxLength={2}
          value={patternMessage.rowColorOffset}
          onChange={handleIntegerInputChange}
          title="Offset for the even row colors."
        />
      )}
      <MultiRangeSlider
        label="Rotation"
        id="rotationRangeInput"
        title="Range of rotation values to use for the elements."
        minVal={patternMessage.rotationRange[0]}
        maxVal={patternMessage.rotationRange[1]}
        min={ROTATION_RANGE_LIMITS[0]}
        max={ROTATION_RANGE_LIMITS[1]}
        onChange={handleRotationRangeSliderChange}
      />
      <MultiRangeSlider
        label="Opacity"
        id="opacityRangeInput"
        title="Range of opacity values to use for the elements."
        minVal={patternMessage.opacityRange[0]}
        maxVal={patternMessage.opacityRange[1]}
        min={OPACITY_RANGE_LIMITS[0]}
        max={OPACITY_RANGE_LIMITS[1]}
        units="%"
        onChange={handleOpacityRangeSliderChange}
      />
      <MultiRangeSlider
        label="Size"
        id="sizeRangeInput"
        title="Range of size values to use for the elements."
        minVal={patternMessage.sizeRange[0]}
        maxVal={patternMessage.sizeRange[1]}
        min={SIZE_RANGE_LIMITS[0]}
        max={SIZE_RANGE_LIMITS[1]}
        units="%"
        onChange={handleSizeRangeSliderChange}
      />
    </CollapsibleSubsection>
  );
}
