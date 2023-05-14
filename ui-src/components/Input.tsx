import type {
  DetailedHTMLProps,
  InputHTMLAttributes,
  PropsWithChildren,
} from "react";
import React, { RefObject } from "react";

export default function Input({
  label,
  id,
  className,
  forwardRef,
  children,
  columns,
  title,
  type,
  ...props
}: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> &
  PropsWithChildren<{
    label: string;
    id: string;
    forwardRef?: RefObject<HTMLInputElement>;
    columns?: true;
  }>) {
  return (
    <label
      htmlFor={id}
      className={`flex gap-2 ${columns ? "flex-col" : "items-center"}`}
      title={title}
    >
      <span className="whitespace-nowrap">
        {label}
        {children ? ` (${children})` : ""}:
      </span>
      <input
        id={id}
        className={`grow bg-inherit text-inherit ${
          type === "color" ? "" : "border-b-2 border-white"
        } ${className}`}
        ref={forwardRef}
        type={type}
        {...props}
      />
    </label>
  );
}
