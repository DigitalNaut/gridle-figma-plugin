import React, { useState } from "react";

import {
  Layout,
  CollapsibleSubsection,
  Subsection,
  Footer,
} from "@components/Layout";
import {
  NotificationAborted,
  NotificationError,
} from "@components/Notifications";
import MultiRangeSlider from "@components/MultiRangeSlider";
import Input from "@components/Input";
import Button from "@components/Button";
import { useWindowKeyboardEvents } from "@hooks/useWindowKeyboardEvents";
import { usePluginMessaging } from "@hooks/usePluginMessaging";
import { useBasicInputs, useManagedInputs } from "@hooks/useUserInputs";
import { useColorHandlers } from "@hooks/useColorHandlers";
import { sleep } from "@common/utils/index";

import type { GeneratePatternMessage } from "@common/index";
import {
  noiseModes,
  opacityThresholdModes,
  supportedShapes,
  verticalFadeModes,
} from "@common/settings";
import {
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
  initialInputValues,
  presetInputs,
} from "./constants";
import "./index.css";

enum AppState {
  IDLE = "idle",
  GENERATING = "generating",
  COMPLETE = "complete",
  ABORTED = "aborted",
  ERROR = "error",
}

const messageTitles = {
  [AppState.ABORTED]: "Generation aborted",
  [AppState.ERROR]: "Generation error",
};

function Main() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [pluginMessage, setPluginMessage] = useState(initialInputValues);
  const [elementWidth, setElementWidth] = useState(
    pluginMessage.frameWidth / pluginMessage.horizontalElementsCount
  );
  const [elementHeight, setElementHeight] = useState(
    pluginMessage.frameHeight / pluginMessage.verticalElementsCount
  );

  const {
    handleFrameWidthChange,
    handleFrameHeightChange,
    handleFrameHeightChangeDerivedProperties,
    handleFrameWidthChangeDerivedProperties,
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handlePaddingXChange,
    handlePaddingYChange,
  } = useManagedInputs(setPluginMessage, setElementWidth, setElementHeight);

  const handleRangeSliderChange = (opacityRange: [number, number]) =>
    setPluginMessage((prev) => ({ ...prev, opacityRange }));

  const { handleSelectChange } = useBasicInputs(setPluginMessage);

  const { handleColorChange, handleAddColor, handleRemoveColor } =
    useColorHandlers(setPluginMessage, pluginMessage);

  const handleMessages: typeof onmessage = async ({
    data: { pluginMessage },
  }) => {
    const { type } = pluginMessage || {};

    if (type === "generation-progress") setProgress(pluginMessage.progress);

    if (type === "generation-complete") {
      setState(AppState.COMPLETE);
      await sleep(300);
      setState(AppState.IDLE);
      console.log("Generation complete.");
    }

    if (type === "generation-started") {
      setState(AppState.GENERATING);
      console.log("Generation started.");
    }

    if (type === "generation-aborted") {
      setState(AppState.ABORTED);
      await sleep(1500);
      setState(AppState.IDLE);
      console.log("Generation aborted.");
    }

    if (type === "generation-error") {
      setState(AppState.ERROR);
      setError(pluginMessage.error);
    }
  };

  const { onCreate, onClose } = usePluginMessaging(handleMessages);

  useWindowKeyboardEvents(async (event: KeyboardEvent) => {
    // TODO: Bugfix - Enter key does not update the plugin message before creating the pattern.
    // if (event.key === "Enter") onCreate(pluginMessage);
    if (event.key === "Escape") onClose();
  });

  if (state === AppState.GENERATING || state === AppState.COMPLETE)
    return (
      <>
        <Subsection title="Generating...">
          <div>{`Progress: ${(progress * 100).toFixed(1)}%`}</div>
          <progress className="w-full" value={progress} max={1} />
        </Subsection>
        <Footer>
          <Button
            appearance="actionStyle"
            disabled={state === AppState.COMPLETE}
            onClick={() => {
              parent.postMessage(
                { pluginMessage: { type: "generate-abort" } },
                "*"
              );
            }}
          >
            {state === AppState.COMPLETE ? "Done!" : "Cancel generation"}
          </Button>
        </Footer>
      </>
    );

  if (state === AppState.ABORTED || state === AppState.ERROR) {
    const title = messageTitles[state];

    return (
      <>
        <Subsection title={title}>
          {state === AppState.ABORTED && <NotificationAborted />}
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

  return (
    <>
      <Subsection title="Presets">
        <label htmlFor="presetSelect" title="Presets">
          Predefined settings:&nbsp;
          <select
            className="rounded-sm bg-zinc-700 p-2"
            id="presetSelect"
            name="presets"
            onChange={({ currentTarget }) => {
              setPluginMessage(presetInputs[currentTarget.value]);
            }}
          >
            {Object.entries(presetInputs).map(([name], index) => (
              <option
                key={index}
                className="rounded-sm bg-zinc-700 p-2"
                value={name}
              >
                {name}
              </option>
            ))}
          </select>
        </label>
      </Subsection>
      <Subsection title="Frame">
        <Input<GeneratePatternMessage, number>
          label="Width (px)"
          id="frameWidthInput"
          name="frameWidth"
          type="number"
          min={MIN_FRAME_SIZE}
          max={MAX_FRAME_SIZE}
          value={pluginMessage.frameWidth}
          onChange={handleFrameWidthChange}
          onBlur={handleFrameWidthChangeDerivedProperties}
          onInvalid={(event) => console.log(event.currentTarget)}
          title="Width of the frame in pixels."
        />
        <Input<GeneratePatternMessage, number>
          label="Height (px)"
          id="frameHeightInput"
          name="frameHeight"
          type="number"
          min={MIN_FRAME_SIZE}
          max={MAX_FRAME_SIZE}
          value={pluginMessage.frameHeight}
          onChange={handleFrameHeightChange}
          onBlur={handleFrameHeightChangeDerivedProperties}
          title="Height of the frame in pixels."
        />
      </Subsection>
      <Subsection title="Elements">
        <span>
          {`Element size: ${parseFloat(
            (elementWidth - pluginMessage.paddingX).toFixed(2)
          )} x ${parseFloat(
            (elementHeight - pluginMessage.paddingY).toFixed(2)
          )} px`}
        </span>
        <Input<GeneratePatternMessage, number>
          label="Horizontal count"
          id="horizontalCountInput"
          name="horizontalElementsCount"
          type="number"
          min={1}
          max={pluginMessage.frameWidth.toFixed(0)}
          value={pluginMessage.horizontalElementsCount}
          onChange={handleHorizontalElementsCountChange}
          title="Number of elements to create horizontally."
        />
        <Input<GeneratePatternMessage, number>
          label="Vertical count"
          id="verticalCountInput"
          name="verticalElementsCount"
          type="number"
          min={1}
          max={pluginMessage.frameHeight.toFixed(0)}
          value={pluginMessage.verticalElementsCount}
          onChange={handleVerticalElementsCountChange}
          title="Number of elements to create vertically."
        />
        <Input<GeneratePatternMessage, number>
          label="Padding X (px)"
          id="paddingXInput"
          name="paddingX"
          type="number"
          min={0}
          max={(elementWidth - 1).toFixed(0)}
          value={parseFloat(pluginMessage.paddingX.toFixed(2))}
          onChange={handlePaddingXChange}
          title="Padding between elements in pixels."
        />
        <Input<GeneratePatternMessage, number>
          label="Padding Y (px)"
          id="paddingYInput"
          name="paddingY"
          type="number"
          min={0}
          max={(elementHeight - 1).toFixed(0)}
          value={parseFloat(pluginMessage.paddingY.toFixed(2))}
          onChange={handlePaddingYChange}
          title="Padding between elements in pixels."
        />
      </Subsection>
      <Subsection title={`Appearance`}>
        <label htmlFor="shapeSelect" title="Shape of the elements:">
          Shape:&nbsp;
          <select
            className="rounded-sm bg-zinc-700 p-2"
            id="shapeSelect"
            name="shape"
            value={pluginMessage.shape}
            onChange={handleSelectChange}
          >
            {Object.values(supportedShapes || {}).map((shape) => (
              <option key={shape} className="capitalize" value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </label>
        <MultiRangeSlider
          label="Opacity range"
          id="opacityRangeInput"
          title="Range of opacity values to use for the elements."
          minVal={pluginMessage.opacityRange[0]}
          maxVal={pluginMessage.opacityRange[1]}
          min={pluginMessage.opacityRangeLimits[0]}
          max={pluginMessage.opacityRangeLimits[1]}
          units="%"
          onChange={handleRangeSliderChange}
        />
        <div className="flex w-full flex-col gap-2">
          {`Colors (${pluginMessage.colors.length})`}
          <div className="flex w-full">
            {pluginMessage.colors.map((color, colorIndex) => (
              <div key={colorIndex} className="group relative h-10 w-1/5">
                <label title="Color to use for the elements.">
                  <input
                    className="h-full w-full rounded-sm bg-zinc-700"
                    id="colorsInput"
                    name="colors"
                    type="color"
                    value={color}
                    onChange={({ currentTarget }) =>
                      handleColorChange(currentTarget.value, colorIndex)
                    }
                  />
                  {colorIndex > 0 && (
                    <button
                      className="absolute right-0 top-0 hidden h-5 w-5 items-center justify-center rounded-full shadow-sm group-hover:flex group-hover:border group-hover:bg-zinc-600 group-hover:shadow-md"
                      title="Remove color"
                      role="button"
                      onClick={() => handleRemoveColor(colorIndex)}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </label>
              </div>
            ))}
            {pluginMessage.colors.length < 5 && (
              <button
                className="flex h-9 w-1/5 items-center justify-center rounded-md border border-zinc-200 text-xl font-bold text-zinc-200"
                title="Add color"
                role="button"
                onClick={handleAddColor}
              >
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
            )}
          </div>
        </div>
      </Subsection>
      <CollapsibleSubsection title="Options">
        <label
          htmlFor="verticalFadeModeSelect"
          title="Create a vertical fade by changing the opacity values of the elements in the direction selected."
        >
          Vertical fade:&nbsp;
          <select
            className="rounded-sm bg-zinc-700 p-2"
            id="verticalFadeModeSelect"
            name="verticalFadeMode"
            value={pluginMessage.verticalFadeMode}
            onChange={handleSelectChange}
          >
            {Object.values(verticalFadeModes).map((shape) => (
              <option key={shape} className="capitalize" value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="noiseModeInput"
          title="Remove random elements to add noise and create a more organic look."
        >
          Add noise:&nbsp;
          <select
            className="rounded-sm bg-zinc-700 p-2"
            id="noiseModeInput"
            name="noiseMode"
            value={pluginMessage.noiseMode}
            onChange={handleSelectChange}
          >
            {Object.values(noiseModes).map((shape) => (
              <option key={shape} className="capitalize" value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="opacityThresholdModeSelect"
          title="How to handle elements with opacity value below the threshold."
        >
          Outside opacity range:&nbsp;
          <select
            className="rounded-sm bg-zinc-700 p-2"
            id="opacityThresholdModeSelect"
            name="opacityThresholdMode"
            value={pluginMessage.opacityThresholdMode}
            onChange={handleSelectChange}
          >
            {Object.values(opacityThresholdModes).map((shape) => (
              <option key={shape} className="capitalize" value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </label>
      </CollapsibleSubsection>
      <Footer>
        <div className="bottom-0 flex w-full justify-end">
          <Button onClick={onClose}>Close</Button>
          <Button
            appearance="filledStyle"
            onClick={() => onCreate(pluginMessage)}
          >
            Create
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
