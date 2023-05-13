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
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  PropsWithChildren<{
    className?: string;
    onClick: () => void;
  }>) {
  return (
    <button
      className={`bg-white text-black px-2 py-1 rounded-sm w-full ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
