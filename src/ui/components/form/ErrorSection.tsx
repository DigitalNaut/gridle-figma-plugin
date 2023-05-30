import { useApplicationState } from "~/hooks/useApplicationState";
import { AppState } from "~/settings";
import Button from "../Button";
import { Subsection, Footer } from "../Layout";
import { NotificationStopped, NotificationError } from "../Notifications";

const titleMessages: Partial<Record<AppState, string>> = {
  [AppState.STOPPED]: "Generation stopped",
  [AppState.ERROR]: "Generation error",
};

export function ErrorSection() {
  const { appState, error, setAppState, setError } = useApplicationState();

  const title = titleMessages[appState] ?? "Unknown error";

  return (
    <>
      <Subsection title={title}>
        {appState === AppState.STOPPED && <NotificationStopped />}
        {appState === AppState.ERROR && (
          <NotificationError errorMessage={error} />
        )}
      </Subsection>
      <Footer>
        <Button
          appearance="actionStyle"
          onClick={() => {
            setAppState(AppState.IDLE);
            setError(undefined);
          }}
        >
          Ok
        </Button>
      </Footer>
    </>
  );
}
