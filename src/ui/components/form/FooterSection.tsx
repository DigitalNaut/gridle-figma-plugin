import { elementSelectionTypes } from "@common";

import Button from "~/components/Button";
import { Footer } from "~/components/Layout";
import { useApplicationState } from "~/hooks/useApplicationState";
import { usePatternDataContext } from "~/hooks/usePatternData";
import { usePluginMessagingContext } from "~/hooks/usePluginMessaging";
import { AppState } from "~/settings";

export function FooterSection() {
  const { setAppState } = useApplicationState();
  const { patternData: patternMessage } = usePatternDataContext();
  const { selectionType, pluginMessenger, setProgress } =
    usePluginMessagingContext();
  const { startGeneration, onClose } = pluginMessenger;

  return (
    <Footer>
      <div className="bottom-0 flex w-full justify-end gap-2">
        <Button onClick={onClose}>Close</Button>
        <Button
          appearance="filledStyle"
          disabled={
            patternMessage.shape === "selection" &&
            selectionType.type !== elementSelectionTypes.supported
          }
          onClick={() => {
            setAppState(AppState.GENERATING);
            setProgress({ percentProgress: 0, timeElapsed: 0 });
            startGeneration(patternMessage);
          }}
        >
          Generate
        </Button>
      </div>
    </Footer>
  );
}
