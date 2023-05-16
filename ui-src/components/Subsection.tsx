import type { PropsWithChildren } from "react";
import React, { useState } from "react";

export function Subsection({
  title,
  children,
}: PropsWithChildren<{ title: string; rows?: true; noGap?: true }>) {
  return (
    <>
      <h3 className="text-xl">{title}</h3>
      <div className="flex w-full flex-col gap-2 rounded-sm bg-black/20 p-2">
        {children}
      </div>
    </>
  );
}

export function CollapsibleSubsection({
  title,
  children,
  open = false,
}: PropsWithChildren<{
  title: string;
  open?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(open);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <>
      <h3 className="w-full text-xl">
        <button className="flex w-full items-center gap-2" onClick={toggleOpen}>
          <div className={`transform ${isOpen ? "rotate-90" : "rotate-0"}`}>
            <i className="fa-solid fa-angle-right"></i>
          </div>
          {title}
          {isOpen || (
            <span className="text-sm text-gray-400"> (click to open)</span>
          )}
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
