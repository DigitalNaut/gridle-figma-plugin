import React, { PropsWithChildren } from "react";

export default function Subsection({
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
