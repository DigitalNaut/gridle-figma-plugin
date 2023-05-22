import type { ExtractKeysByValueType } from "@common/utils/index";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  PropsWithChildren,
} from "react";

export default function Select<T, U extends string | number>({
  label,
  prompt,
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
    options: readonly U[];
    value?: U;
    prompt?: string;
  }>) {
  return (
    <label htmlFor={id} className="flex gap-2" title={title}>
      {label && <span className="grow whitespace-nowrap">{label}</span>}
      <select
        className={`rounded-sm bg-zinc-700 p-2 ${
          label ? "" : "grow"
        } ${className}`}
        id={id}
        name={name}
        value={value}
        {...props}
      >
        {prompt?.length && (
          <option value="" className="normal-case">{`--${prompt}--`}</option>
        )}
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
