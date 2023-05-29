import { useApplicationState } from "~/hooks/useApplicationState";
import { AppState } from "~/settings";
import Button from "../Button";
import { Subsection, Footer } from "../Layout";
import { NotificationStopped, NotificationError } from "../Notifications";

export function ErrorSection() {
  const { appState, error, setAppState, setError } = useApplicationState();

  let title = "Unknown error";

  switch (appState) {
    case AppState.STOPPED:
      title = "Generation stopped";
      break;
    case AppState.ERROR:
      title = "Generation error";
      break;
  }

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
