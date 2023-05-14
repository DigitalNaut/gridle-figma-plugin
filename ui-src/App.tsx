import React, { FormEvent, useReducer } from "react";

import Logo from "@/Logo";
import Input from "@/Input";
import Button from "@/Button";
import { useWindowKeyDownEvent } from "./hooks/WindowEvents";
import "./index.css";

enum ActionType {
  Update = "update",
  Reset = "reset",
}

type UpdateAction = {
  type: ActionType.Update;
  payload: Partial<GenerateSquaresMessage>;
};

type ResetAction = {
  type: ActionType.Reset;
  payload: GenerateSquaresMessage;
};

type Action = UpdateAction | ResetAction;

function inputReducer(state: GenerateSquaresMessage, action: Action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    case "reset":
      return action.payload;
    default:
      throw new Error();
  }
}

export default function App() {
  const initialInputValues: GenerateSquaresMessage = {
    type: "generate-squares",
    frameWidth: 300,
    frameHeight: 300,
    horizontalSquaresCount: 30,
    verticalSquaresCount: 30,
    padding: 2,
    alphaThreshold: 0.05,
    alphaThresholdMode: "remove",
    colors: "#86198f",
    removeRandom: true,
  };
  const [pluginMessage, inputDispatch] = useReducer(
    inputReducer,
    initialInputValues
  );

  const onCreate = () => parent.postMessage({ pluginMessage }, "*");
  const onReset = () =>
    inputDispatch({ type: ActionType.Reset, payload: initialInputValues });
  const onCancel = () =>
    parent.postMessage({ pluginMessage: { type: "close" } }, "*");

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") onCreate();
    if (event.key === "Escape") onCancel();
  };

  const handleInputChange = (
    event: FormEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // use the target's value in case of a select element, or an input element of type other than checkbox
    // This is needed to appease TypeScript
    const newValue =
      event.currentTarget instanceof HTMLSelectElement ||
      event.currentTarget.type !== "checkbox"
        ? event.currentTarget.value
        : event.currentTarget.checked;

    inputDispatch({
      type: ActionType.Update,
      payload: { [event.currentTarget.name]: newValue },
    });
  };

  const validateInputs = () => {
    const {
      frameWidth,
      frameHeight,
      horizontalSquaresCount,
      verticalSquaresCount,
    } = pluginMessage;

    if (horizontalSquaresCount > Math.floor(frameWidth / 10))
      inputDispatch({
        type: ActionType.Update,
        payload: { horizontalSquaresCount: Math.floor(frameWidth / 10) },
      });

    if (verticalSquaresCount > Math.floor(frameHeight / 10))
      inputDispatch({
        type: ActionType.Update,
        payload: { verticalSquaresCount: Math.floor(frameHeight / 10) },
      });
  };

  useWindowKeyDownEvent(onKeyDown);

  return (
    <main className="flex w-full flex-col items-center gap-2 p-4">
      <header className="flex items-center justify-center gap-2">
        <Logo />
        <h2 className="text-2xl">Patterner</h2>
      </header>
      <section className="flex w-full flex-col gap-4">
        <h3 className="text-xl">Frame size</h3>
        <div className="flex w-full flex-col gap-2 rounded-sm bg-slate-700 p-2">
          <Input
            label="Width (px)"
            id="frameWidthInput"
            name="frameWidth"
            type="number"
            min="0"
            value={pluginMessage.frameWidth}
            onChange={handleInputChange}
            onBlur={validateInputs}
            title="Width of the frame in pixels."
          />
          <Input
            label="Height (px)"
            id="frameHeightInput"
            name="frameHeight"
            type="number"
            min="0"
            value={pluginMessage.frameHeight}
            onChange={handleInputChange}
            onBlur={validateInputs}
            title="Height of the frame in pixels."
          />
        </div>
        <h3 className="text-xl">Squares</h3>
        <div className="flex w-full flex-col gap-2 rounded-sm bg-slate-700 p-2">
          <Input
            label="Horizontal count"
            id="horizontalCountInput"
            name="horizontalSquaresCount"
            type="number"
            min="0"
            max={(Number(pluginMessage.frameWidth) ?? 0) / 10}
            value={pluginMessage.horizontalSquaresCount}
            onChange={handleInputChange}
            title="Number of squares to create horizontally."
          />
          <Input
            label="Vertical count"
            id="verticalCountInput"
            name="verticalSquaresCount"
            type="number"
            min="0"
            max={(Number(pluginMessage.frameHeight) ?? 0) / 10}
            value={pluginMessage.verticalSquaresCount}
            onChange={handleInputChange}
            title="Number of squares to create vertically."
          />
          <Input
            label="Padding (px)"
            id="paddingInput"
            name="padding"
            type="number"
            min="0"
            max={Math.min(
              (Number(pluginMessage.frameHeight) ?? 0) / 10 - 1,
              (Number(pluginMessage.frameWidth) ?? 0) / 10 - 1
            )}
            value={pluginMessage.padding}
            onChange={handleInputChange}
            title="Padding between squares in pixels."
          />
        </div>
        <h3 className="text-xl">Colors</h3>
        <div className="flex w-full flex-col gap-2 rounded-sm bg-slate-700 p-2">
          <Input
            label="Colors"
            id="colorsInput"
            name="colors"
            type="color"
            value={pluginMessage.colors}
            onChange={handleInputChange}
          />
        </div>
        <h3 className="text-xl">Options</h3>
        <div
          className="flex w-full flex-col gap-2 rounded-sm bg-slate-700 p-2"
          title="How to handle elements with alpha value below the threshold."
        >
          <Input
            columns
            label="Alpha threshold"
            id="alphaThresholdInput"
            name="alphaThreshold"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={pluginMessage.alphaThreshold}
            onChange={handleInputChange}
            title="Minimum alpha value to be considered as a filled pixel."
          >
            {`${(pluginMessage.alphaThreshold * 100).toFixed(0)}%`}
          </Input>
          <label
            className="text-sm"
            htmlFor="alphaThresholdModeInput"
            title="How to handle elements with alpha value below the threshold."
          >
            Squares below threshold:
            <select
              className="rounded-sm bg-slate-700 p-2"
              id="alphaThresholdModeInput"
              name="alphaThresholdMode"
              value={pluginMessage.alphaThresholdMode}
              onChange={handleInputChange}
            >
              <option selected value="remove">
                Remove
              </option>
              <option value="clamp">Clamp</option>
            </select>
          </label>
          <Input
            label="Remove random squares"
            id="removeRandomInput"
            name="removeRandom"
            type="checkbox"
            checked={pluginMessage.removeRandom}
            onChange={handleInputChange}
            title="Remove random squares to create a more organic look."
          />
        </div>
        <footer className="flex w-full justify-end gap-2">
          <Button onClick={onCancel}>Close</Button>
          <Button onClick={onReset}>Reset</Button>
          <Button filled onClick={onCreate}>
            Create
          </Button>
        </footer>
      </section>
    </main>
  );
}
