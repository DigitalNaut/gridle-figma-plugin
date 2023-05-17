import type { PropsWithChildren } from "react";
import React, { useState } from "react";

import Logo from "@/Logo";

export function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex w-full flex-col items-center gap-2 p-4">
      <header className="flex items-center justify-center gap-2">
        <Logo />
        <h2 className="text-2xl">Gridle</h2>
      </header>
      <section className="flex w-full flex-col gap-4">{children}</section>
    </main>
  );
}

export function Footer({ children }: PropsWithChildren) {
  return <footer className="flex w-full gap-2">{children}</footer>;
}

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
          <i
            className={`fa-solid fa-angle-right transform ${
              isOpen ? "rotate-90" : "rotate-0"
            }`}
          ></i>
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
