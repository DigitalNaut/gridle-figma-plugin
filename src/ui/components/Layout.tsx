import type { PropsWithChildren } from "react";

import Logo from "~components/Logo";

export function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex w-full flex-col items-center gap-2 rounded-md p-2">
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

const subsectionBaseStyle =
  "flex w-full flex-col gap-2 rounded-md bg-black/10 p-3";

export function Subsection({
  title,
  children,
}: PropsWithChildren<{ title: string; rows?: true; noGap?: true }>) {
  return (
    <>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className={subsectionBaseStyle}>{children}</div>
    </>
  );
}

export function CollapsibleSubsection({
  id,
  title,
  children,
  isOpen,
  onToggle,
}: PropsWithChildren<{
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string, isOpen: boolean) => void;
}>) {
  return (
    <>
      <h3 className="w-full text-sm font-semibold">
        <button
          className="flex w-full items-center gap-3"
          onClick={() => onToggle(id, !isOpen)}
        >
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
      {isOpen && <div className={subsectionBaseStyle}>{children}</div>}
    </>
  );
}
