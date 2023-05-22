import { useEffect } from "react";

export function useWindowKeyboardEvents(event: (event: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener("keydown", event);

    return () => {
      window.removeEventListener("keydown", event);
    };
  }, [event]);

  return null;
}
