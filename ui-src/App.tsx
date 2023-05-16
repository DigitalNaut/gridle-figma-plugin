import React, { useState } from "react";

import Logo from "@/Logo";
import Input from "@/Input";
import Button from "@/Button";
import { CollapsibleSubsection, Subsection } from "@/Subsection";
import { useWindowKeyDownEvent } from "hooks/WindowEvents";
import { useAppEvents } from "hooks/AppEvents";
import { useBasicInputs, useManagedInputs } from "hooks/useUserInputs";
import {
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
  initialInputValues,
} from "./constants";
import "./index.css";
import { useColorHandlers } from "hooks/useColorHandlers";
import MultiRangeSlider from "@/MultiRangeSlider";

export default function App() {
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

  const { onCreate, onClose } = useAppEvents();
  const onReset = () => setPluginMessage(initialInputValues);

  useWindowKeyDownEvent(async (event: KeyboardEvent) => {
    // if (event.key === "Enter") onCreate(pluginMessage); // TODO: Bugfix - Enter key does not update the plugin message before creating the pattern.
    if (event.key === "Escape") onClose();
  });

  return (
    <main className="flex w-full flex-col items-center gap-2 p-4">
      <header className="flex items-center justify-center gap-2">
        <Logo />
        <h2 className="text-2xl">Gridle</h2>
      </header>
      <section className="flex w-full flex-col gap-4">
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
              <option value="square">Square</option>
              <option value="circle">Circle</option>
            </select>
          </label>
          <MultiRangeSlider
            label="Opacity range"
            id="opacityRangeInput"
            title="Range of opacity values to use for the elements."
            minVal={pluginMessage.opacityRange[0]}
            maxVal={pluginMessage.opacityRange[1]}
            min={0}
            max={100}
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
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
              <option value="none">None</option>
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
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
              <option value="uniform">Uniform</option>
              <option value="none">None</option>
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
              <option value="remove">Remove</option>
              <option value="clamp">Clamp</option>
            </select>
          </label>
        </CollapsibleSubsection>
        <footer className="flex w-full justify-end gap-2">
          <Button onClick={onClose}>Close</Button>
          <Button onClick={onReset}>Reset</Button>
          <Button filled onClick={() => onCreate(pluginMessage)}>
            Create
          </Button>
        </footer>
      </section>
    </main>
  );
}
