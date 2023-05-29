import { formatSeconds, toPercentage } from "@common";

import { Footer, Subsection } from "~/components/Layout";
import Button from "~/components/Button";
import { usePluginMessagingContext } from "~/hooks/usePluginMessaging";
import { AppState } from "~/settings";
import { useApplicationState } from "~/hooks/useApplicationState";

export function MessageSection() {
  const { appState } = useApplicationState();
  const {
    progress,
    pluginMessenger: { stopGeneration, abortGeneration },
  } = usePluginMessagingContext();

  return (
    <>
      <Subsection title="Generating...">
        <div>{`Progress: ${toPercentage(progress.percentProgress)}`}</div>
        <progress className="w-full" value={progress.percentProgress} max={1} />
        <div>{`Time elapsed: ${formatSeconds(progress.timeElapsed)}s`}</div>
      </Subsection>
      <Footer>
        {appState === AppState.COMPLETE ? (
          <Button appearance="actionStyle" disabled>
            Done!
          </Button>
        ) : (
          <div className="flex w-full flex-col">
            <Button
              appearance="actionStyle"
              title="Stop the generation process and keep the current progress."
              onClick={stopGeneration}
            >
              Stop
            </Button>
            <Button
              appearance="actionStyle"
              title="Abort the generation process and discard the current progress."
              onClick={abortGeneration}
            >
              Cancel
            </Button>
          </div>
        )}
      </Footer>
    </>
  );
}
