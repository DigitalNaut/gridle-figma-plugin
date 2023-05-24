import type {
  DetailedHTMLProps,
  ButtonHTMLAttributes,
  PropsWithChildren,
} from "react";
import { useMemo } from "react";

const buttonStyles = {
  actionStyle:
    "flex h-9 w-full items-center justify-center rounded-md border border-zinc-200 text-lg text-zinc-200 disabled:border-zinc-500 disabled:text-zinc-500",
  filledStyle:
    "rounded-sm bg-white px-4 text-black disabled:bg-zinc-300 disabled:text-zinc-800",
  plainStyle: "px-1 underline",
};

export default function Button({
  className,
  children,
  appearance = "plainStyle",
  ...props
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  PropsWithChildren<{
    appearance?: keyof typeof buttonStyles;
  }>) {
  const style = useMemo(() => buttonStyles[appearance], [appearance]);

  return (
    <button className={`py-1 ${style} ${className}`} {...props}>
      {children}
    </button>
  );
}
