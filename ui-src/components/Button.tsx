import type {
  DetailedHTMLProps,
  ButtonHTMLAttributes,
  PropsWithChildren,
} from "react";
import React from "react";

export default function Button({
  className,
  children,
  onClick,
  filled,
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  PropsWithChildren<{
    className?: string;
    filled?: true;
  }>) {
  return (
    <button
      className={`py-1 ${
        filled ? "rounded-sm bg-white px-4 text-black" : "px-2 underline"
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
