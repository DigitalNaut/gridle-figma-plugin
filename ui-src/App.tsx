import { useMemo, useState } from "react";

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
import { useWindowKeyboardEvents } from "@hooks/useWindowKeyboardEvents";
import { usePluginMessaging } from "@hooks/usePluginMessaging";
import { useBasicInputs, useManagedInputs } from "@hooks/useUserInputs";
import { useColorHandlers } from "@hooks/useColorHandlers";
import { formatSeconds, sleep, toFloat, toPercent } from "@common/utils/index";

import type { PresetRecord } from "./constants";
import type { PatternDataMessage } from "@common/index";
import {
  messageTypes,
  noiseModes,
  opacityThresholdModes,
  supportedShapes,
  verticalFadeModes,
} from "@common/index";
import {
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
  defaultInputValues,
  presetInputs,
} from "./constants";
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
  const [progress, setProgress] = useState({ percentage: 0, timeElapsed: 0 });
  const [availablePresets] = useState<PresetRecord>(presetInputs);
  const [patternMessage, setPatternMessage] =
    useState<PatternDataMessage>(defaultInputValues);

  const elementWidth = useMemo(
    () => patternMessage.frameWidth / patternMessage.horizontalElementsCount,
    [patternMessage.frameWidth, patternMessage.horizontalElementsCount],
  );
  const elementHeight = useMemo(
    () => patternMessage.frameHeight / patternMessage.verticalElementsCount,
    [patternMessage.frameHeight, patternMessage.verticalElementsCount],
  );

  const applyPreset = (value: string) =>
    setPatternMessage((prev) => ({
      ...prev,
      ...availablePresets[value],
    }));

  const applyDefaultPreset = () => setPatternMessage(defaultInputValues);

  const handleRangeSliderChange = (opacityRange: [number, number]) =>
    setPatternMessage((prev) => ({ ...prev, opacityRange }));
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
    handlePaddingXChange,
    handlePaddingYChange,
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
          <div>{`Progress: ${toPercent(progress.percentage)}`}</div>
          <progress className="w-full" value={progress.percentage} max={1} />
          <div>{`Time elapsed: ${formatSeconds(progress.timeElapsed)}s`}</div>
        </Subsection>
        <Footer>
          {state === AppState.COMPLETE ? (
            <Button appearance="actionStyle" disabled>
              Done!
            </Button>
          ) : (
            <div className="flex flex-col w-full">
              <Button appearance="actionStyle" onClick={stopGeneration}>
                Stop generation
              </Button>
              <Button appearance="actionStyle" onClick={abortGeneration}>
                Cancel generation
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

  const calculatedElementWidth = toFloat(
    elementWidth - patternMessage.paddingX,
  );
  const calculatedElementHeight = toFloat(
    elementHeight - patternMessage.paddingY,
  );

  return (
    <>
      <CollapsibleSubsection title="Global Presets">
        <Select
          prompt="Select a preset"
          options={Object.keys(presetInputs)}
          id="presetSelect"
          onChange={({ currentTarget }) => applyPreset(currentTarget.value)}
          title="Predefined settings."
        />
        <Button appearance="plainStyle" onClick={applyDefaultPreset}>
          <i className="fa-solid fa-rotate-left"></i> Reset settings
        </Button>
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
      </CollapsibleSubsection>
      <Subsection title="Frame">
        <Input<PatternDataMessage, number>
          label="Width (px)"
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
          label="Height (px)"
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
      </Subsection>
      <Subsection title="Elements">
        <div className="flex w-full">
          <span className="grow">Element size:</span>
          <span>
            {`${calculatedElementWidth} x ${calculatedElementHeight} px`}
          </span>
        </div>
        <Input<PatternDataMessage, number>
          label="Horizontal count"
          id="horizontalCountInput"
          name="horizontalElementsCount"
          type="number"
          min={1}
          max={toFloat(patternMessage.frameWidth)}
          maxLength={4}
          value={patternMessage.horizontalElementsCount}
          onChange={handleHorizontalElementsCountChange}
          title="Number of elements to create horizontally."
        />
        <Input<PatternDataMessage, number>
          label="Vertical count"
          id="verticalCountInput"
          name="verticalElementsCount"
          type="number"
          min={1}
          max={toFloat(patternMessage.frameHeight)}
          maxLength={4}
          value={patternMessage.verticalElementsCount}
          onChange={handleVerticalElementsCountChange}
          title="Number of elements to create vertically."
        />
        <Input<PatternDataMessage, number>
          label="Padding X (px)"
          id="paddingXInput"
          name="paddingX"
          type="number"
          min={0}
          max={toFloat(elementWidth - 1)}
          maxLength={8}
          value={toFloat(patternMessage.paddingX)}
          onChange={handlePaddingXChange}
          title="Padding between elements in pixels."
        />
        <Input<PatternDataMessage, number>
          label="Padding Y (px)"
          id="paddingYInput"
          name="paddingY"
          type="number"
          min={0}
          max={toFloat(elementHeight - 1)}
          maxLength={8}
          value={toFloat(patternMessage.paddingY)}
          onChange={handlePaddingYChange}
          title="Padding between elements in pixels."
        />
      </Subsection>
      <Subsection title={`Appearance`}>
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
        <MultiColorPicker
          colors={patternMessage.colors}
          handleAddColor={handleAddColor}
          handleColorChange={handleColorChange}
          handleRemoveColor={handleRemoveColor}
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
