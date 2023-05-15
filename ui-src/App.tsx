import React, {
  FormEvent,
  Fragment,
  PropsWithChildren,
  useReducer,
} from "react";

import Logo from "@/Logo";
import Input from "@/Input";
import Button from "@/Button";
import Subsection from "@/Subsection";
import { useWindowKeyDownEvent } from "./hooks/WindowEvents";
import "./index.css";

enum ActionType {
  Update = "update",
  Reset = "reset",
}

type UpdateAction = {
  type: ActionType.Update;
  payload: Partial<GeneratePatternMessage>;
};

type ResetAction = {
  type: ActionType.Reset;
  payload: GeneratePatternMessage;
};

type Action = UpdateAction | ResetAction;

function inputReducer(state: GeneratePatternMessage, action: Action) {
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
  const initialInputValues: GeneratePatternMessage = {
    type: "generate-pattern",
    frameWidth: 300,
    frameHeight: 300,
    horizontalElementsCount: 30,
    verticalElementsCount: 30,
    padding: 2,
    alphaThreshold: 0.05,
    alphaThresholdMode: "remove",
    colors: ["#86198f"],
    shape: "square",
    removeRandom: true,
    verticalFadeMode: "ascending",
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
      horizontalElementsCount,
      verticalElementsCount,
    } = pluginMessage;

    if (horizontalElementsCount > Math.floor(frameWidth / 10))
      inputDispatch({
        type: ActionType.Update,
        payload: { horizontalElementsCount: Math.floor(frameWidth / 10) },
      });

    if (verticalElementsCount > Math.floor(frameHeight / 10))
      inputDispatch({
        type: ActionType.Update,
        payload: { verticalElementsCount: Math.floor(frameHeight / 10) },
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
        <Subsection title="Frame">
          <Input
            label="Width (px)"
            id="frameWidthInput"
            name="frameWidth"
            type="number"
            min="0"
            max="1920"
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
            max="1920"
            value={pluginMessage.frameHeight}
            onChange={handleInputChange}
            onBlur={validateInputs}
            title="Height of the frame in pixels."
          />
        </Subsection>
        <Subsection title="Elements">
          <Input
            label="Horizontal count"
            id="horizontalCountInput"
            name="horizontalElementsCount"
            type="number"
            min="0"
            max={(Number(pluginMessage.frameWidth) ?? 0) / 10}
            value={pluginMessage.horizontalElementsCount}
            onChange={handleInputChange}
            title="Number of elements to create horizontally."
          />
          <Input
            label="Vertical count"
            id="verticalCountInput"
            name="verticalElementsCount"
            type="number"
            min="0"
            max={(Number(pluginMessage.frameHeight) ?? 0) / 10}
            value={pluginMessage.verticalElementsCount}
            onChange={handleInputChange}
            title="Number of elements to create vertically."
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
                  onChange={(event) => {
                    inputDispatch({
                      type: ActionType.Update,
                      payload: {
                        colors: pluginMessage.colors.map((color, i) =>
                          i === colorIndex ? event.currentTarget.value : color
                        ),
                      },
                    });
                  }}
                />
                {colorIndex > 0 && (
                  <button
                    className="absolute right-0 top-0 hidden h-5 w-5 items-center justify-center rounded-full shadow-sm group-hover:flex group-hover:border group-hover:bg-zinc-600 group-hover:shadow-md"
                    title="Remove color"
                    role="button"
                    onClick={() =>
                      inputDispatch({
                        type: ActionType.Update,
                        payload: {
                          colors: pluginMessage.colors.filter(
                            (_, i) => i !== colorIndex
                          ),
                        },
                      })
                    }
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
              onClick={() =>
                inputDispatch({
                  type: ActionType.Update,
                  payload: {
                    colors: pluginMessage.colors.concat(
                      pluginMessage.colors[pluginMessage.colors.length - 1]
                    ),
                  },
                })
              }
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
              onChange={handleInputChange}
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
            </select>
          </label>
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
            htmlFor="alphaThresholdModeSelect"
            title="How to handle elements with alpha value below the threshold."
          >
            Below threshold:&nbsp;
            <select
              className="rounded-sm bg-zinc-700 p-2"
              id="alphaThresholdModeSelect"
              name="alphaThresholdMode"
              value={pluginMessage.alphaThresholdMode}
              onChange={handleInputChange}
            >
              <option value="remove">Remove</option>
              <option value="clamp">Clamp</option>
            </select>
          </label>
          <Input
            label="Remove random elements"
            id="removeRandomInput"
            name="removeRandom"
            type="checkbox"
            checked={pluginMessage.removeRandom}
            onChange={handleInputChange}
            title="Remove random elements to create a more organic look."
          />
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
              onChange={handleInputChange}
            >
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
              <option value="none">None</option>
            </select>
          </label>
        </Subsection>
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
