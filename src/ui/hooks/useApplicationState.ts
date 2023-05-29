import { useContext } from "react";

import { ApplicationStateContext } from "~/context/ApplicationStateContext";

export function useApplicationState() {
  const context = useContext(ApplicationStateContext);
  if(!context) throw new Error("ApplicationStateContext not found");
  return context;
}