import { useState } from "react";

import { ElementSelection } from "@common";
import {
  elementSelectionTypes,
  formatSeconds,
  sleep,
  toPercentage,
  messageTypes,
} from "@common";

import { Layout, Subsection, Footer } from "~/components/Layout";
import {
  NotificationStopped,
  NotificationError,
} from "~/components/Notifications";
import Button from "~/components/Button";
import { OptionsSection } from "~/components/form/Options";
import { AppearanceSection } from "~/components/form/Appearance";
import { FrameSection } from "~/components/form/Frame";
import { SettingsSection } from "~/components/form/Settings";
import { PatternMessageProvider } from "~/context/PatternMessage";
import { useWindowKeyboardEvents } from "~/hooks/useWindowKeyboardEvents";
import { usePluginMessaging } from "~/hooks/usePluginMessaging";
import { usePatternMessage } from "~/hooks/usePatternMessage";

import type { Preset, PresetRecord } from "./settings";
import { globalPresets } from "./settings";
import "./index.css";

enum AppState {
  IDLE = "idle",
  GENERATING = "generating",
  COMPLETE = "complete",
  STOPPED = "aborted",
  ERROR = "error",
}

const messageTitles = {
  [AppState.STOPPED]: "Generation stopped",
  [AppState.ERROR]: "Generation error",
};

function Main() {
  const { patternMessage, setPatternMessage } = usePatternMessage();
  const [error, setError] = useState<string>();
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState({
    percentProgress: 0,
    timeElapsed: 0,
  });
  const [selectionType, setSelectionType] = useState<ElementSelection>({
    type: "none",
  });
  const [availablePresets] = useState<PresetRecord>(globalPresets);
  const [isSectionOpen, setIsSubsectionOpen] = useState<
    Record<string, boolean>
  >({
    settings: false,
    frame: true,
    appearance: true,
    colors: false,
  });

  const handleMessages: typeof onmessage = async ({
    data: { pluginMessage },
  }) => {
    switch (pluginMessage?.type) {
      case messageTypes.generationProgress:
        setProgress(pluginMessage.data);
        break;

      case messageTypes.generationComplete:
        setAppState(AppState.COMPLETE);
        await sleep(300);
        setAppState(AppState.IDLE);
        break;

      case messageTypes.generationStarted:
        setAppState(AppState.GENERATING);
        break;

      case messageTypes.generationStopped:
        setAppState(AppState.STOPPED);
        await sleep(1500);
        setAppState(AppState.IDLE);
        break;

      case messageTypes.generationError:
        setAppState(AppState.ERROR);
        setError(pluginMessage.error);
        break;

      case messageTypes.presetLoaded:
        setPatternMessage(pluginMessage.data.preset);
        break;

      case messageTypes.selectionChanged:
        setSelectionType(pluginMessage.data);
        break;

      default:
        break;
    }
  };

  const { stopGeneration, abortGeneration, startGeneration, onClose } =
    usePluginMessaging(handleMessages);

  const applyPreset = (value: Preset) =>
    setPatternMessage((prev) => ({
      ...prev,
      ...value,
    }));

  useWindowKeyboardEvents(async (event: KeyboardEvent) => {
    // TODO: Bugfix - Enter key does not update the plugin message before creating the pattern.
    // if (event.key === "Enter") onCreate(pluginMessage);
    if (event.key === "Escape") onClose();
  });

  if (appState === AppState.GENERATING || appState === AppState.COMPLETE)
    return (
      <>
        <Subsection title="Generating...">
          <div>{`Progress: ${toPercentage(progress.percentProgress)}`}</div>
          <progress
            className="w-full"
            value={progress.percentProgress}
            max={1}
          />
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

  if (appState === AppState.STOPPED || appState === AppState.ERROR) {
    const title = messageTitles[appState];

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

  const handleSectionToggle = (section: string, isOpen: boolean) =>
    setIsSubsectionOpen((prev) => ({ ...prev, [section]: isOpen }));

  return (
    <>
      <SettingsSection
        isSectionOpen={isSectionOpen.settings}
        handleSectionToggle={() =>
          handleSectionToggle("settings", !isSectionOpen.settings)
        }
        applyPreset={applyPreset}
        availablePresets={availablePresets}
        handleMessages={handleMessages}
      />
      <FrameSection
        isSectionOpen={isSectionOpen.frame}
        handleSectionToggle={() =>
          handleSectionToggle("frame", !isSectionOpen.frame)
        }
      />
      <AppearanceSection
        isSectionOpen={isSectionOpen.appearance}
        handleSectionToggle={() =>
          handleSectionToggle("appearance", !isSectionOpen.appearance)
        }
        applyPreset={applyPreset}
        selectionType={selectionType}
      />
      <OptionsSection
        isSectionOpen={isSectionOpen.options}
        handleSectionToggle={() =>
          handleSectionToggle("options", !isSectionOpen.options)
        }
      />
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
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <PatternMessageProvider>
        <Main />
      </PatternMessageProvider>
    </Layout>
  );
}
