import { useContext } from "react";

import { PatternMessageContext } from "~/context/PatternMessage";

export function usePatternMessage() {
  const context = useContext(PatternMessageContext);
  if (!context) throw new Error("PatternMessageContext not found");
  return context;
}
