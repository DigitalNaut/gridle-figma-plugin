import type { PropsWithChildren } from "react";
import { createContext, useState } from "react";

import { AppState } from "~/settings";

type ApplicationStateContext = {
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
  error?: string;
  setError: (error?: string) => void;
  appState: AppState;
  setAppState: (appState: AppState) => void;
};

export const ApplicationStateContext = createContext<ApplicationStateContext>({
  loaded: false,
  setLoaded: () => null,
  error: undefined,
  setError: () => null,
  appState: AppState.IDLE,
  setAppState: () => null,
});

export function ApplicationStateProvider({ children }: PropsWithChildren) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);

  return (
    <ApplicationStateContext.Provider
      value={{
        loaded,
        setLoaded,
        error,
        setError,
        appState,
        setAppState,
      }}
    >
      {children}
    </ApplicationStateContext.Provider>
  );
}
