import { useMemo, useState } from "react";

import type {
  PatternDataMessage,
  supportedShapes,
  verticalFadeModes,
  noiseModes,
  ElementSelection,
} from "@common";
import {
  elementSelectionTypes,
  formatSeconds,
  sleep,
  toFloat,
  toPercentage,
  messageTypes,
  opacityThresholdModes,
  defaultInputValues,
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
  OPACITY_RANGE_LIMITS,
  ROTATION_RANGE_LIMITS,
  SIZE_RANGE_LIMITS,
} from "@common";

import {
  Layout,
  CollapsibleSubsection,
  Subsection,
  Footer,
} from "@components/Layout";
import {
  NotificationStopped,
  NotificationError,
} from "@components/Notifications";
import MultiRangeSlider from "@components/MultiRangeSlider";
import Input from "@components/Input";
import Button from "@components/Button";
import Select from "@components/Select";
import MultiColorPicker from "@components/MultiColorPicker";
import AxisIcon from "@components/AxisIcon";
import PaddingIcon from "@components/PaddingIcon";
import ButtonSelect from "@components/ButtonSelect";
import InlineNotice from "@components/InlineWarning";
import { useWindowKeyboardEvents } from "@hooks/useWindowKeyboardEvents";
import { usePluginMessaging } from "@hooks/usePluginMessaging";
import { useBasicInputs, useManagedInputs } from "@hooks/useUserInputs";
import { useColorHandlers } from "@hooks/useColorHandlers";

import type { Preset, PresetRecord } from "./settings";
import { globalPresets, colorPresets } from "./settings";
import "./index.css";

enum AppState {
  IDLE = "idle",
  GENERATING = "generating",
  COMPLETE = "complete",
  STOPPED = "aborted",
  ERROR = "error",
}

const messageTitles = {
  [AppState.STOPPED]: "Generation stopped",
  [AppState.ERROR]: "Generation error",
};

function Main() {
  const [error, setError] = useState<string>();
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState({
    percentProgress: 0,
    timeElapsed: 0,
  });
  const [selectionType, setSelectionType] = useState<ElementSelection>({
    type: "none",
  });
  const [availablePresets] = useState<PresetRecord>(globalPresets);
  const [patternMessage, setPatternMessage] =
    useState<PatternDataMessage>(defaultInputValues);
  const [isSectionOpen, setIsSubsectionOpen] = useState<
    Record<string, boolean>
  >({
    settings: false,
    frame: true,
    appearance: true,
    colors: false,
  });

  const elementWidth = useMemo(
    () => patternMessage.frameWidth / patternMessage.columns,
    [patternMessage.frameWidth, patternMessage.columns],
  );
  const elementHeight = useMemo(
    () => patternMessage.frameHeight / patternMessage.rows,
    [patternMessage.frameHeight, patternMessage.rows],
  );

  const applyPreset = (value: Preset) =>
    setPatternMessage((prev) => ({
      ...prev,
      ...value,
    }));

  const applyDefaultPreset = () => setPatternMessage(defaultInputValues);

  const handleOpacityRangeSliderChange = (opacityRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, opacityRange }));
  const handleSizeRangeSliderChange = (sizeRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, sizeRange }));
  const handleRotationRangeSliderChange = (rotationRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, rotationRange }));
  const { handleStringInputChange, handleNumberInputChange } =
    useBasicInputs(setPatternMessage);
  const { handleColorChange, handleAddColor, handleRemoveColor } =
    useColorHandlers(setPatternMessage, patternMessage);
  const {
    handleFrameWidthChange,
    handleFrameHeightChange,
    handleFrameWidthBlur,
    handleFrameHeightBlur,
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handleXPaddingChange,
    handleYPaddingChange,
  } = useManagedInputs(setPatternMessage);

  const handleMessages: typeof onmessage = async ({
    data: { pluginMessage },
  }) => {
    switch (pluginMessage?.type) {
      case messageTypes.generationProgress:
        setProgress(pluginMessage.data);
        break;

      case messageTypes.generationComplete:
        setAppState(AppState.COMPLETE);
        await sleep(300);
        setAppState(AppState.IDLE);
        break;

      case messageTypes.generationStarted:
        setAppState(AppState.GENERATING);
        break;

      case messageTypes.generationStopped:
        setAppState(AppState.STOPPED);
        await sleep(1500);
        setAppState(AppState.IDLE);
        break;

      case messageTypes.generationError:
        setAppState(AppState.ERROR);
        setError(pluginMessage.error);
        break;

      case messageTypes.presetLoaded:
        setPatternMessage(pluginMessage.data.preset);
        break;

      case messageTypes.selectionChanged:
        setSelectionType(pluginMessage.data);
        break;

      default:
        break;
    }
  };

  const {
    stopGeneration,
    abortGeneration,
    startGeneration,
    savePreset,
    clearPreset,
    loadPreset,
    onClose,
  } = usePluginMessaging(handleMessages);

  useWindowKeyboardEvents(async (event: KeyboardEvent) => {
    // TODO: Bugfix - Enter key does not update the plugin message before creating the pattern.
    // if (event.key === "Enter") onCreate(pluginMessage);
    if (event.key === "Escape") onClose();
  });

  if (appState === AppState.GENERATING || appState === AppState.COMPLETE)
    return (
      <>
        <Subsection title="Generating...">
          <div>{`Progress: ${toPercentage(progress.percentProgress)}`}</div>
          <progress
            className="w-full"
            value={progress.percentProgress}
            max={1}
          />
          <div>{`Time elapsed: ${formatSeconds(progress.timeElapsed)}s`}</div>
        </Subsection>
        <Footer>
          {appState === AppState.COMPLETE ? (
            <Button appearance="actionStyle" disabled>
              Done!
            </Button>
          ) : (
            <div className="flex w-full flex-col">
              <Button
                appearance="actionStyle"
                title="Stop the generation process and keep the current progress."
                onClick={stopGeneration}
              >
                Stop
              </Button>
              <Button
                appearance="actionStyle"
                title="Abort the generation process and discard the current progress."
                onClick={abortGeneration}
              >
                Cancel
              </Button>
            </div>
          )}
        </Footer>
      </>
    );

  if (appState === AppState.STOPPED || appState === AppState.ERROR) {
    const title = messageTitles[appState];

    return (
      <>
        <Subsection title={title}>
          {appState === AppState.STOPPED && <NotificationStopped />}
          {appState === AppState.ERROR && (
            <NotificationError errorMessage={error} />
          )}
        </Subsection>
        <Footer>
          <Button
            appearance="actionStyle"
            onClick={() => {
              setAppState(AppState.IDLE);
              setError(undefined);
            }}
          >
            Ok
          </Button>
        </Footer>
      </>
    );
  }

  const derivedElementWidth = toFloat(elementWidth - patternMessage.xPadding);
  const derivedElementHeight = toFloat(elementHeight - patternMessage.yPadding);

  const handleSectionToggle = (section: string, isOpen: boolean) =>
    setIsSubsectionOpen((prev) => ({ ...prev, [section]: isOpen }));

  return (
    <>
      <CollapsibleSubsection
        id="settings"
        title="Settings"
        isOpen={isSectionOpen.settings}
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
      <CollapsibleSubsection
        isOpen={isSectionOpen.frame}
        id="frame"
        title="Frame"
        onToggle={handleSectionToggle}
      >
        <div className="flex w-full">
          <span className="grow text-sm">Frame size</span>
        </div>
        <div className="flex flex-1 justify-between gap-2">
          <Input<PatternDataMessage, number>
            label="W"
            labelStyle="flex-1"
            labelTextStyle="flex-1 w-6 text-center"
            id="frameWidthInput"
            name="frameWidth"
            type="number"
            min={MIN_FRAME_SIZE}
            max={MAX_FRAME_SIZE}
            maxLength={4}
            value={patternMessage.frameWidth}
            onChange={handleFrameWidthChange}
            onBlur={handleFrameWidthBlur}
            title="Width of the frame in pixels."
          />
          <Input<PatternDataMessage, number>
            label="H"
            labelStyle="flex-1"
            labelTextStyle="flex-1 w-6 text-center"
            id="frameHeightInput"
            name="frameHeight"
            type="number"
            min={MIN_FRAME_SIZE}
            max={MAX_FRAME_SIZE}
            maxLength={4}
            value={patternMessage.frameHeight}
            onChange={handleFrameHeightChange}
            onBlur={handleFrameHeightBlur}
            title="Height of the frame in pixels."
          />
        </div>
        <div className="flex flex-1 justify-between gap-2">
          <Input<PatternDataMessage, number>
            label={<AxisIcon className="rotate-90 transform" />}
            labelStyle="flex-1"
            id="rowsInput"
            name="rows"
            type="number"
            min={1}
            max={toFloat(patternMessage.frameWidth)}
            maxLength={4}
            value={patternMessage.columns}
            onChange={handleHorizontalElementsCountChange}
            title="Number of rows."
          />
          <Input<PatternDataMessage, number>
            label={<AxisIcon />}
            labelStyle="flex-1"
            id="columnsInput"
            name="columns"
            type="number"
            min={1}
            max={toFloat(patternMessage.frameHeight)}
            maxLength={4}
            value={patternMessage.rows}
            onChange={handleVerticalElementsCountChange}
            title="Number of columns."
          />
        </div>
        <div className="flex w-full">
          <span className="grow text-sm">Padding</span>
        </div>
        <div className="flex w-full gap-2">
          <Input<PatternDataMessage, number>
            label={<PaddingIcon className="rotate-90 transform" />}
            labelStyle="flex-1"
            id="xPaddingInput"
            name="xPadding"
            type="number"
            min={0}
            max={toFloat(elementWidth - 1)}
            maxLength={8}
            value={toFloat(patternMessage.xPadding)}
            onChange={handleXPaddingChange}
            title="Horizontal padding between elements."
          />
          <Input<PatternDataMessage, number>
            label={<PaddingIcon />}
            labelStyle="flex-1"
            id="yPaddingInput"
            name="yPadding"
            type="number"
            min={0}
            max={toFloat(elementHeight - 1)}
            maxLength={8}
            value={toFloat(patternMessage.yPadding)}
            onChange={handleYPaddingChange}
            title="Vertical padding between elements."
          />
        </div>
        <div className="flex w-full justify-between pt-2">
          <span>Element size:</span>
          <span className="flex items-center gap-1">
            <span className={derivedElementWidth < 0 ? "text-orange-500" : ""}>
              {derivedElementWidth}
            </span>
            x
            <span className={derivedElementHeight < 0 ? "text-orange-500" : ""}>
              {derivedElementHeight}
            </span>
            px
          </span>
        </div>
      </CollapsibleSubsection>
      <CollapsibleSubsection
        isOpen={isSectionOpen.appearance}
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
                <details
                  className="grow"
                  title="Please select a valid element."
                >
                  <summary className="flex cursor-pointer gap-1">
                    <span>Selection not supported:</span>
                    <span>{selectionType.element}</span>
                  </summary>
                  <div className="mb-1 mt-0 bg-white/60 py-1 pl-2 text-zinc-800">
                    <span>A selection can be:</span>
                    <ul className="list-inside list-disc pl-2">
                      <li>
                        <span className="group relative border-b-2 border-dotted border-zinc-800/75">
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
            onChange={handleNumberInputChange}
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
            onChange={handleNumberInputChange}
            title="Corner radius of the elements."
          />
        )}
        <MultiColorPicker
          label={`Colors (${patternMessage.colors.length})`}
          colors={patternMessage.colors}
          onAddColor={handleAddColor}
          onChangeColor={handleColorChange}
          onRemoveColor={handleRemoveColor}
        />
        {patternMessage.shape !== "selection" &&
          patternMessage.colors.length < 1 && (
            <InlineNotice>
              No colors; the pattern will be invisible
            </InlineNotice>
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
      <CollapsibleSubsection
        id="options"
        title="Options"
        isOpen={isSectionOpen.options}
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
            onChange={handleNumberInputChange}
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
      <Footer>
        <div className="bottom-0 flex w-full justify-end gap-2">
          <Button onClick={onClose}>Close</Button>
          <Button
            appearance="filledStyle"
            disabled={
              patternMessage.shape === "selection" &&
              selectionType.type === elementSelectionTypes.notSupported
            }
            onClick={() => {
              setAppState(AppState.GENERATING);
              setProgress({ percentProgress: 0, timeElapsed: 0 });
              startGeneration(patternMessage);
            }}
          >
            Generate
          </Button>
        </div>
      </Footer>
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Main />
    </Layout>
  );
}
