import { useContext } from "react";

import { PatternMessageContext } from "~/context/PatternMessageContext";

export function usePatternMessageContext() {
  const context = useContext(PatternMessageContext);
  if (!context) throw new Error("PatternMessageContext not found");
  return context;
}
