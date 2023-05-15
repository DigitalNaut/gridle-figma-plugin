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
  children,
  columns,
  title,
  type,
  disabled,
  ...props
}: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> &
  PropsWithChildren<{
    label: string;
    id: string;
    forwardRef?: RefObject<HTMLInputElement>;
    columns?: true;
  }>) {
  const hasBorder = !disabled && type !== "color";
  return (
    <label
      htmlFor={id}
      className={`flex gap-2 ${columns ? "flex-col" : "items-center"}`}
      title={title}
    >
      <span className="whitespace-nowrap">{label}</span>
      <input
        className={`grow bg-inherit text-inherit ${
          hasBorder ? "border-b-2 border-white" : ""
        } ${className}`}
        id={id}
        type={type}
        {...props}
      />
      {children}
    </label>
  );
}
