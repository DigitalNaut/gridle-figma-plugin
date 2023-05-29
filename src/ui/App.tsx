import { useState } from "react";

import { Layout } from "~/components/Layout";
import { OptionsSection } from "~/components/form/OptionsSection";
import { AppearanceSection } from "~/components/form/AppearanceSection";
import { FrameSection } from "~/components/form/FrameSection";
import { SettingsSection } from "~/components/form/SettingsSection";
import { FooterSection } from "~/components/form/FooterSection";
import { MessageSection } from "~/components/form/MessageSection";
import { ErrorSection } from "~/components/form/ErrorSection";
import { PatternDataProvider } from "~/context/PatternDataContext";
import { useWindowKeyboardEvents } from "~/hooks/useWindowKeyboardEvents";
import { usePluginMessagingContext } from "~/hooks/usePluginMessaging";
import { PluginMessagingProvider } from "~/context/PluginMessageContext";
import { ApplicationStateProvider } from "~/context/ApplicationStateContext";
import { useApplicationState } from "~/hooks/useApplicationState";
import { AppState } from "~/settings";

import "~/index.css";

function Main() {
  const [isSectionOpen, setIsSubsectionOpen] = useState<
    Record<string, boolean>
  >({
    settings: false,
    frame: true,
    appearance: true,
    colors: false,
  });

  const { appState } = useApplicationState();
  const { pluginMessenger, messageHandler } = usePluginMessagingContext();
  const { onClose } = pluginMessenger;

  onmessage ??= messageHandler;

  useWindowKeyboardEvents(async (event: KeyboardEvent) => {
    // if (event.key === "Enter") onCreate(pluginMessage); // TODO: Bugfix - Enter key does not update the plugin message before creating the pattern.
    if (event.key === "Escape") onClose();
  });

  if (appState === AppState.STOPPED || appState === AppState.ERROR)
    return <ErrorSection />;

  if (appState === AppState.GENERATING || appState === AppState.COMPLETE)
    return <MessageSection />;

  const handleSectionToggle = (section: string, isOpen: boolean) =>
    setIsSubsectionOpen((prev) => ({ ...prev, [section]: isOpen }));

  return (
    <>
      <SettingsSection
        isSectionOpen={isSectionOpen.settings}
        handleSectionToggle={() =>
          handleSectionToggle("settings", !isSectionOpen.settings)
        }
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
      />
      <OptionsSection
        isSectionOpen={isSectionOpen.options}
        handleSectionToggle={() =>
          handleSectionToggle("options", !isSectionOpen.options)
        }
      />
      <FooterSection />
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <ApplicationStateProvider>
        <PatternDataProvider>
          <PluginMessagingProvider>
            <Main />
          </PluginMessagingProvider>
        </PatternDataProvider>
      </ApplicationStateProvider>
    </Layout>
  );
}
