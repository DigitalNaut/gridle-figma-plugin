// See: Building a Multi-Range Slider in React From Scratch
// Article: https://dev.to/sandra_lewis/building-a-multi-range-slider-in-react-from-scratch-4dl1
// Sandbox: https://codesandbox.io/s/b9l0g

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

// TODO: Fix the webkit-thumb:reset-range-thumb style
// it's not working for some reason so the thumb style doesn't reset on Electron
const thumbStyle = `pointer-events-none absolute h-0 w-full outline-none 
  webkit-thumb:reset-range-thumb
  range-thumb:pointer-events-auto
  range-thumb:relative
  range-thumb:mt-1
  range-thumb:h-[16px]
  range-thumb:w-[16px]
  range-thumb:cursor-pointer
  range-thumb:rounded-[50%]
  range-thumb:border-white
  range-thumb:border-2
  range-thumb:bg-gray-500
  range-thumb:shadow-sm
  range-thumb:focus:ring
`;

export default function MultiRangeSlider({
  minVal,
  maxVal,
  min,
  max,
  label,
  id,
  title,
  units = "",
  onChange,
}: {
  minVal: number;
  maxVal: number;
  min: number;
  max: number;
  label: string;
  id: string;
  title: string;
  units?: string;
  onChange: (value: [number, number]) => void;
}) {
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (!maxValRef.current) return;
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(+maxValRef.current.value); // Precede with '+' to convert the value from type string to type number

    if (!range.current) return;
    range.current.style.left = `${minPercent}%`;
    range.current.style.width = `${maxPercent - minPercent}%`;
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (!range.current) return;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <label htmlFor={id} className="flex flex-col gap-3" title={title}>
      <span className="whitespace-nowrap">{label}</span>
      <div className="relative flex w-full items-center justify-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          ref={minValRef}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newMin = Math.min(+event.target.value, maxVal - 1);
            onChange([newMin, maxVal]);
            event.target.value = newMin.toString();
          }}
          className={`z-[3] ${thumbStyle}
        ${minVal > max - 20 ? "z-[5]" : ""}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          ref={maxValRef}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newMax = Math.max(+event.target.value, minVal + 1);
            onChange([minVal, newMax]);
            event.target.value = newMax.toString();
          }}
          className={`z-[4] ${thumbStyle}`}
        />

        <div className="relative w-full">
          <div className="absolute inset-0 z-[1] h-[6px] w-full rounded border border-[#acacac] bg-[#3b3b3b] opacity-75 hover:opacity-100 active:opacity-75" />
          <div
            className="absolute z-[2] h-[6px] rounded bg-blue-500"
            ref={range}
          />
        </div>
      </div>
      <div className="flex w-full justify-between">
        <div className="relative text-sm text-current">{`${minVal}${units}`}</div>
        <div className="relative text-sm text-current">{`${maxVal}${units}`}</div>
      </div>
    </label>
  );
}
