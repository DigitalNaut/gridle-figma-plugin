import React, { PropsWithChildren } from "react";

export function Subsection({
  title,
  children,
  rows,
  noGap,
}: PropsWithChildren<{ title: string; rows?: true; noGap?: true }>) {
  return (
    <>
      <h3 className="text-xl">{title}</h3>
      <div
        className={`flex w-full rounded-sm bg-black/20 p-2 ${
          rows ? "items-center" : "flex-col"
        } ${noGap ? "" : "gap-2"}`}
      >
        {children}
      </div>
    </>
  );
}

export function CollapsibleSubsection({
  title,
  children,
  open,
}: PropsWithChildren<{
  title: string;
  open?: boolean;
}>) {
  const [isOpen, setIsOpen] = React.useState(open ?? false);

  return (
    <>
      <h3 className="w-full text-xl">
        <button
          className="flex w-full items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "▼" : "▶"}
          {title}
        </button>
      </h3>
      {isOpen && (
        <div className="flex w-full flex-col gap-2 rounded-sm bg-black/20 p-2">
          {children}
        </div>
      )}
    </>
  );
}
