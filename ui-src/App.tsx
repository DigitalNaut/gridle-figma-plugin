import React, { ChangeEventHandler, useState } from "react";

import Logo from "@/Logo";
import Input from "@/Input";
import Button from "@/Button";
import Subsection from "@/Subsection";
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

export default function App() {
  const [pluginMessage, setPluginMessage] = useState(initialInputValues);

  const { onCreate, onClose } = useAppEvents();
  const onReset = () => setPluginMessage(initialInputValues);

  useWindowKeyDownEvent((event: KeyboardEvent) => {
    if (event.key === "Enter") onCreate(pluginMessage);
    if (event.key === "Escape") onClose();
  });

  const {
    handleFrameWidthChange,
    handleFrameHeightChange,
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handlePaddingXChange,
    handlePaddingYChange,
  } = useManagedInputs(setPluginMessage);

  const { handleSelectChange, handleInputChange, handleCheckboxChange } =
    useBasicInputs(setPluginMessage);

  const { handleColorChange, handleAddColor, handleRemoveColor } =
    useColorHandlers(setPluginMessage, pluginMessage);

  const elementWidth =
    pluginMessage.frameWidth / pluginMessage.horizontalElementsCount;

  const elementHeight =
    pluginMessage.frameHeight / pluginMessage.verticalElementsCount;

  return (
    <main className="flex w-full flex-col items-center gap-2 p-4">
      <header className="flex items-center justify-center gap-2">
        <Logo />
        <h2 className="text-2xl">Patterner</h2>
      </header>
      <section className="flex w-full flex-col gap-4">
        <Subsection title="Frame">
          <Input
            label="Width (px)"
            id="frameWidthInput"
            name="frameWidth"
            type="number"
            min={MIN_FRAME_SIZE}
            max={MAX_FRAME_SIZE}
            value={pluginMessage.frameWidth}
            onChange={handleFrameWidthChange}
            onInvalid={(event) => console.log(event.currentTarget)}
            title="Width of the frame in pixels."
          />
          <Input
            label="Height (px)"
            id="frameHeightInput"
            name="frameHeight"
            type="number"
            min={MIN_FRAME_SIZE}
            max={MAX_FRAME_SIZE}
            value={pluginMessage.frameHeight}
            onChange={handleFrameHeightChange}
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
          <Input
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
          <Input
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
          <Input
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
          <Input
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
        <Subsection
          rows
          noGap
          title={`Colors (${pluginMessage.colors.length})`}
        >
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
                    ×
                  </button>
                )}
              </label>
            </div>
          ))}
          {pluginMessage.colors.length < 5 && (
            <button
              className="flex h-full w-1/5 items-center justify-center rounded-md border border-zinc-200 text-xl font-bold text-zinc-200"
              title="Add color"
              role="button"
              onClick={handleAddColor}
            >
              +
            </button>
          )}
        </Subsection>
        <Subsection title="Options">
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
          <label
            htmlFor="verticalFadeModeSelect"
            title="Create a vertical fade by changing the alpha values of the elements in the direction selected."
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
          <Input
            columns
            className="cursor-pointer accent-current"
            label={`Alpha threshold ${(
              pluginMessage.alphaThreshold * 100
            ).toFixed(0)}%`}
            id="alphaThresholdInput"
            name="alphaThreshold"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={pluginMessage.alphaThreshold}
            onChange={handleInputChange}
            title="Minimum alpha value to be considered as a filled pixel."
          />
          <label
            htmlFor="alphaThresholdModeSelect"
            title="How to handle elements with alpha value below the threshold."
          >
            Below threshold:&nbsp;
            <select
              className="rounded-sm bg-zinc-700 p-2"
              id="alphaThresholdModeSelect"
              name="alphaThresholdMode"
              value={pluginMessage.alphaThresholdMode}
              onChange={handleSelectChange}
            >
              <option value="remove">Remove</option>
              <option value="clamp">Clamp</option>
            </select>
          </label>
          <Input
            className="accent-current"
            label="Remove random elements"
            id="removeRandomInput"
            name="removeRandom"
            type="checkbox"
            checked={pluginMessage.removeRandom}
            onChange={handleCheckboxChange}
            title="Remove random elements to create a more organic look."
          />
        </Subsection>
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
