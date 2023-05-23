import { useMemo, useState } from "react";

import type { PatternDataMessage } from "@common/index";
import {
  formatSeconds,
  sleep,
  toFloat,
  toPercentage,
} from "@common/utils/index";
import {
  messageTypes,
  noiseModes,
  opacityThresholdModes,
  supportedShapes,
  verticalFadeModes,
} from "@common/index";

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
import { useWindowKeyboardEvents } from "@hooks/useWindowKeyboardEvents";
import { usePluginMessaging } from "@hooks/usePluginMessaging";
import { useBasicInputs, useManagedInputs } from "@hooks/useUserInputs";
import { useColorHandlers } from "@hooks/useColorHandlers";

import type { Preset, PresetRecord } from "./settings";
import {
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
  defaultInputValues,
  globalPresets,
  colorPresets,
} from "./settings";
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
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState({
    percentProgress: 0,
    timeElapsed: 0,
  });
  const [availablePresets] = useState<PresetRecord>(globalPresets);
  const [patternMessage, setPatternMessage] =
    useState<PatternDataMessage>(defaultInputValues);

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

  const handleRangeSliderChange = (opacityRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, opacityRange }));
  const handleSizeRangeSliderChange = (sizeRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, sizeRange }));
  const { handleSelectChange, handleInputChange } =
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
        setState(AppState.COMPLETE);
        await sleep(300);
        setState(AppState.IDLE);
        break;

      case messageTypes.generationStarted:
        setState(AppState.GENERATING);
        break;

      case messageTypes.generationStopped:
        setState(AppState.STOPPED);
        await sleep(1500);
        setState(AppState.IDLE);
        break;

      case messageTypes.generationError:
        setState(AppState.ERROR);
        setError(pluginMessage.error);
        break;

      case messageTypes.presetLoaded:
        setPatternMessage(pluginMessage.preset);
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
    onClose,
  } = usePluginMessaging(handleMessages);

  useWindowKeyboardEvents(async (event: KeyboardEvent) => {
    // TODO: Bugfix - Enter key does not update the plugin message before creating the pattern.
    // if (event.key === "Enter") onCreate(pluginMessage);
    if (event.key === "Escape") onClose();
  });

  if (state === AppState.GENERATING || state === AppState.COMPLETE)
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
          {state === AppState.COMPLETE ? (
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

  if (state === AppState.STOPPED || state === AppState.ERROR) {
    const title = messageTitles[state];

    return (
      <>
        <Subsection title={title}>
          {state === AppState.STOPPED && <NotificationStopped />}
          {state === AppState.ERROR && (
            <NotificationError errorMessage={error} />
          )}
        </Subsection>
        <Footer>
          <Button
            appearance="actionStyle"
            onClick={() => {
              setState(AppState.IDLE);
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

  return (
    <>
      <CollapsibleSubsection title="Settings">
        <Select
          prompt="Select a preset"
          options={Object.keys(globalPresets)}
          id="presetSelect"
          onChange={({ currentTarget }) =>
            applyPreset(availablePresets[currentTarget.value])
          }
          title="Predefined settings."
        />
        <div className="flex items-center">
          <span className="grow">Current settings:</span>
          <Button
            appearance="plainStyle"
            onClick={() => savePreset(patternMessage)}
          >
            <i className="fa-solid fa-floppy-disk"></i> Save
          </Button>
          <Button appearance="plainStyle" onClick={clearPreset}>
            <i className="fa-solid fa-trash"></i> Delete
          </Button>
        </div>
        <Button appearance="plainStyle" onClick={applyDefaultPreset}>
          <i className="fa-solid fa-rotate-left"></i> Reset settings
        </Button>
      </CollapsibleSubsection>
      <Subsection title="Frame">
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
      </Subsection>
      <Subsection title={`Appearance`}>
        <Select
          prompt="Select a color preset"
          options={Object.keys(colorPresets)}
          id="colorPresetSelect"
          onChange={({ currentTarget }) =>
            applyPreset(colorPresets[currentTarget.value])
          }
          title="Predefined colors."
        />
        <MultiColorPicker
          colors={patternMessage.colors}
          handleAddColor={handleAddColor}
          handleColorChange={handleColorChange}
          handleRemoveColor={handleRemoveColor}
        />
        <Select<PatternDataMessage, string>
          name="shape"
          options={supportedShapes}
          id="shapeSelect"
          label="Shape"
          value={patternMessage.shape}
          onChange={handleSelectChange}
          title="Shape of the elements."
        />
        <MultiRangeSlider
          label="Opacity range"
          id="opacityRangeInput"
          title="Range of opacity values to use for the elements."
          minVal={patternMessage.opacityRange[0]}
          maxVal={patternMessage.opacityRange[1]}
          min={patternMessage.opacityRangeLimits[0]}
          max={patternMessage.opacityRangeLimits[1]}
          units="%"
          onChange={handleRangeSliderChange}
        />
        <MultiRangeSlider
          label="Size range"
          id="sizeRangeInput"
          title="Range of size values to use for the elements."
          minVal={patternMessage.sizeRange[0]}
          maxVal={patternMessage.sizeRange[1]}
          min={patternMessage.sizeRangeLimits[0]}
          max={patternMessage.sizeRangeLimits[1]}
          units="%"
          onChange={handleSizeRangeSliderChange}
        />
      </Subsection>
      <CollapsibleSubsection title="Options">
        <Select<PatternDataMessage, string>
          name="verticalFadeMode"
          options={verticalFadeModes}
          id="verticalFadeModeSelect"
          label="Vertical fade:"
          value={patternMessage.verticalFadeMode}
          onChange={handleSelectChange}
          title="Create a vertical fade by changing the opacity values of the elements in the direction selected."
        />
        <Select<PatternDataMessage, string>
          name="noiseMode"
          options={noiseModes}
          label="Noise mode:"
          id="noiseModeSelect"
          value={patternMessage.noiseMode}
          onChange={handleSelectChange}
          title="Remove random elements to add noise and create a more organic look."
        />
        {patternMessage.noiseMode !== "none" && (
          <Input<PatternDataMessage, number>
            label="Noise amount"
            id="verticalCountInput"
            name="noiseAmount"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={patternMessage.noiseAmount}
            onChange={handleInputChange}
            title="Number of elements to create vertically."
          />
        )}
        <Select<PatternDataMessage, string>
          name="opacityThresholdMode"
          options={opacityThresholdModes}
          label="Outside opacity range:"
          id="opacityThresholdModeSelect"
          value={patternMessage.opacityThresholdMode}
          onChange={handleSelectChange}
          title="How to handle elements with opacity value below the threshold."
        />
      </CollapsibleSubsection>
      <Footer>
        <div className="bottom-0 flex w-full justify-end">
          <Button onClick={onClose}>Close</Button>
          <Button
            appearance="filledStyle"
            onClick={() => startGeneration(patternMessage)}
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
