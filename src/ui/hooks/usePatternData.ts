import { useContext } from "react";

import { PatternDataContext } from "~/context/PatternDataContext";

export function usePatternDataContext() {
  const context = useContext(PatternDataContext);
  if (!context) throw new Error("PatternMessageContext not found");
  return context;
}
