import type {
  DetailedHTMLProps,
  InputHTMLAttributes,
  PropsWithChildren,
} from "react";
import React, { RefObject } from "react";

import type { ExtractKeysByValueType } from "@common/utils/types";

export default function Input<T extends Record<string, unknown>, U>({
  label,
  id,
  className,
  children,
  columns,
  title,
  type,
  disabled,
  ...props
}: Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  "name"
> &
  PropsWithChildren<{
    label: string;
    id: string;
    forwardRef?: RefObject<HTMLInputElement>;
    columns?: true;
    name: ExtractKeysByValueType<T, U, string>;
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
