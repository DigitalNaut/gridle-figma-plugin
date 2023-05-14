import { useEffect } from "react";

export function useWindowKeyDownEvent(event: (event: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener("keydown", event);

    return () => {
      window.removeEventListener("keydown", event);
    };
  }, []);

  return null;
}
