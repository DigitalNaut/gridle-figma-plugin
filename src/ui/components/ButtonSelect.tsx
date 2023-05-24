import type { PropsWithChildren, MouseEventHandler } from "react";

import type { ExtractKeysByValueType } from "@common";

type Option<U> = {
  optionLabel: JSX.Element;
  value: U;
};

type Event = MouseEventHandler<HTMLButtonElement>;

type Name<T, U extends string | number> = ExtractKeysByValueType<
  T,
  U
> extends never
  ? string | undefined
  : ExtractKeysByValueType<T, U>;

export default function ButtonSelect<
  T,
  U extends string | number,
  V extends readonly string[],
>({
  id,
  title,
  name,
  children,
  label,
  value,
  options,
  className,
  onClick,
}: PropsWithChildren<{
  id: string;
  title: string;
  label: string;
  value: V[number];
  options: Array<Option<V[number]>>;
  name?: Name<T, U>;
  className?: string;
  onClick: Event;
}>) {
  const onOptionClick: Event = (event) => onClick(event);

  return (
    <label htmlFor={id} className="flex items-center gap-2" title={title}>
      {label && <span className="grow whitespace-nowrap">{label}</span>}
      <span id={id}>
        {options.map(({ optionLabel, value: optionValue }, index) => (
          <button
            key={index}
            className={`rounded-sm p-1 ${className} ${
              value === optionValue
                ? "bg-black/40 text-blue-500"
                : "text-current"
            }`}
            name={name}
            title={optionValue.toLocaleUpperCase()}
            value={optionValue}
            onClick={onOptionClick}
          >
            {optionLabel}
          </button>
        ))}
      </span>
      {children}
    </label>
  );
}
