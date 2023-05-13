import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import React, { RefObject } from "react";

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: string;
  id: string;
  forwardRef: RefObject<HTMLInputElement>;
};
export default function Input({
  label,
  id,
  className = "bg-inherit text-inherit border-white border-b-2",
  forwardRef,
  ...props
}: Props) {
  return (
    <div className="flex w-full">
      <label htmlFor={id} className="shrink">
        {label}&nbsp;
      </label>
      <input
        id={id}
        className={`grow ${className}`}
        ref={forwardRef}
        {...props}
      />
    </div>
  );
}
