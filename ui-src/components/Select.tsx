import type { ExtractKeysByValueType } from "@common/utils/index";
import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  PropsWithChildren,
  useMemo,
} from "react";

export default function Select<T, U extends string | number>({
  label,
  id,
  className,
  children,
  title,
  options,
  name,
  value,
  ...props
}: Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>,
  "name"
> &
  PropsWithChildren<{
    label?: string;
    id: string;
    name?: ExtractKeysByValueType<T, U> extends never
      ? string | undefined
      : ExtractKeysByValueType<T, U>;
    options: U[];
    value?: U;
  }>) {
  return (
    <label htmlFor={id} className="flex gap-2" title={title}>
      {label && <span className="grow whitespace-nowrap">{label}</span>}
      <select
        className={`rounded-sm bg-zinc-700 p-2 capitalize ${
          label ? "" : "grow"
        } ${className}`}
        id={id}
        {...props}
      >
        {options.map((optionName, index) => (
          <option key={index} className="capitalize" value={optionName}>
            {optionName}
          </option>
        ))}
        {children}
      </select>
    </label>
  );
}
