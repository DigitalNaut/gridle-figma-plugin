import type { PropsWithChildren } from "react";

export default function InlineNotice({
  children,
  info,
}: PropsWithChildren<{ info?: true }>) {
  return (
    <div
      className={`flex w-full items-baseline gap-1 rounded-lg px-1 text-sm text-white ${
        info ? "bg-blue-600" : "bg-yellow-600"
      }`}
    >
      {info && (
        <span>
          <i className="fa-solid fa-circle-check"></i>
        </span>
      )}
      {info || (
        <span>
          <i className="fa-solid fa-triangle-exclamation"></i>
        </span>
      )}
      {children}
    </div>
  );
}
