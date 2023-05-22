export function NotificationStopped() {
  return (
    <>
      <p>Pattern generation stopped.</p>
      <div className="flex w-full justify-center p-4">
        <i className="fa-solid fa-2x fa-hand"></i>
      </div>
    </>
  );
}

export function NotificationError({ errorMessage }: { errorMessage?: string }) {
  return (
    <>
      <p>Something went wrong.</p>
      <div className="flex gap-2">
        <i className="fa-solid fa-2x fa-bug"></i>
        {errorMessage && (
          <code className="grow rounded-sm bg-zinc-200 p-2 text-xs text-zinc-900">
            {errorMessage}
          </code>
        )}
      </div>
    </>
  );
}
