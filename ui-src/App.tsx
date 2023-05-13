import React, { useRef, useEffect } from "react";
import Logo from "./Logo";
import "./index.css";
import Input from "./components/Input";
import Button from "./components/Button";

function hexToRGB(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  return { r, g, b };
}

function useWindowKeyDownEvent(event: (event: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener("keydown", event);

    return () => {
      window.removeEventListener("keydown", event);
    };
  }, []);
}

export default function App() {
  const inputWidthRef = useRef<HTMLInputElement>(null);
  const inputHeightRef = useRef<HTMLInputElement>(null);
  const inputHorizontalCountRef = useRef<HTMLInputElement>(null);
  const inputVerticalCountRef = useRef<HTMLInputElement>(null);
  const inputPaddingRef = useRef<HTMLInputElement>(null);
  const inputAlphaThresholdRef = useRef<HTMLInputElement>(null);
  const inputColorRef = useRef<HTMLInputElement>(null);

  const onCreate = () => {
    const pluginMessage: GenerateSquaresMessage = {
      type: "generate-squares",
      width: Number(inputWidthRef.current?.value || 100),
      height: Number(inputHeightRef.current?.value || 100),
      horizontalCount: Number(inputHorizontalCountRef.current?.value || 10),
      verticalCount: Number(inputVerticalCountRef.current?.value || 10),
      padding: Number(inputPaddingRef.current?.value || 0),
      alphaThreshold: Number(inputAlphaThresholdRef.current?.value || 0),
      color: hexToRGB(inputColorRef.current?.value || "#000000"),
    };

    parent.postMessage({ pluginMessage }, "*");
  };

  const onCancel = () =>
    void parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") onCreate();
    if (event.key === "Escape") onCancel();
  };

  useWindowKeyDownEvent(onKeyDown);

  return (
    <main className="flex flex-col items-center gap-2 w-full p-4">
      <header className="flex flex-col items-center">
        <Logo />
        <h2 className="text-2xl">Patterner</h2>
      </header>
      <section className="flex flex-col gap-2 w-full">
        <h3 className="text-xl">Frame size</h3>
        <div className="flex flex-col gap-2 w-full p-2 bg-slate-700 rounded-sm">
          <Input
            label="Width:"
            id="widthInput"
            type="number"
            min="0"
            defaultValue={300}
            forwardRef={inputWidthRef}
          />
          <Input
            label="Height:"
            id="heightInput"
            type="number"
            min="0"
            defaultValue={300}
            forwardRef={inputHeightRef}
          />
        </div>
        <h3 className="text-xl">Squares</h3>
        <div className="flex flex-col gap-2 w-full p-2 bg-slate-700 rounded-sm">
          <Input
            label="Horizontal count:"
            id="horizontalCountInput"
            type="number"
            min="0"
            max={(Number(inputWidthRef.current?.value) ?? 0) / 10}
            defaultValue={30}
            forwardRef={inputHorizontalCountRef}
          />
          <Input
            label="Vertical count:"
            id="verticalCountInput"
            type="number"
            min="0"
            max={(Number(inputHeightRef.current?.value) ?? 0) / 10}
            defaultValue={30}
            forwardRef={inputVerticalCountRef}
          />
          <Input
            label="Padding:"
            id="paddingInput"
            type="number"
            min="0"
            max={Math.min(
              (Number(inputWidthRef.current?.value) ?? 0) / 10,
              (Number(inputHeightRef.current?.value) ?? 0) / 10
            )}
            defaultValue={2}
            forwardRef={inputPaddingRef}
          />
          <Input
            label="Alpha threshold:"
            id="alphaThresholdInput"
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue={0.1}
            forwardRef={inputAlphaThresholdRef}
            title="Minimum alpha value to be considered as a filled pixel."
          />
        </div>
        <h3 className="text-xl">Define colors</h3>
        <div className="flex flex-col gap-2 w-full p-2 bg-slate-700 rounded-sm">
          <Input
            label="Base color:"
            id="widthInput"
            type="color"
            defaultValue="#86198f"
            forwardRef={inputColorRef}
          />
        </div>
      </section>
      <footer className="flex gap-2 w-full">
        <Button className="brand" onClick={onCreate}>
          Create
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </footer>
    </main>
  );
}
