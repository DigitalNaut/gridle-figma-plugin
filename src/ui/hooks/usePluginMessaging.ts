import { useContext } from "react";

import { PluginMessagingContext } from "~/context/PluginMessageContext";

export function usePluginMessagingContext() {
  const context = useContext(PluginMessagingContext);
  if (!context) throw new Error("PluginMessageContext not found");
  return context;
}
