import React from "react";
import { createRoot } from "react-dom/client";
import {
  IconButton,
  MessageBar,
  MessageBarButton,
  MessageBarType,
  SearchBox,
  Spinner,
  ThemeProvider,
  initializeIcons,
} from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { darkTheme } from "./themes";
import { CategoriesList } from "./CategoriesList";
import { ChannelsList } from "./ChannelsList";
import { VideoPlayer } from "./VideoPlayer";
import { SettingsDialog, SettingsProvider, useSettings } from "./Settings";
import { useLiveCategories, useLiveChannels } from "./hooks";

initializeIcons();

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <SettingsProvider>
        <IptvPlayer />
      </SettingsProvider>
    </ThemeProvider>
  );
}

function IptvPlayer() {
  const [activeCategory, setActiveCategory] = React.useState<LiveStreamCategory>();
  const [activeChannel, setActiveChannel] = React.useState<LiveStream>();
  const { settings, isValid: validSettings } = useSettings();
  const [settingsDialogVisible, { toggle: toggleSettingsDialog }] =
    useBoolean(false);

  const {
    data: categories,
    loading: loadingCategories,
    error: errorLoadingCateogories,
  } = useLiveCategories();

  const {
    data: channels,
    loading: loadingChannels,
    error: errorLoadingChannels,
  } = useLiveChannels(activeCategory?.category_id);

  const [categorySearchText, setCategorySearchText] = React.useState("");
  const [channelSearchText, setChannelSearchText] = React.useState("");

  const streamUrl = React.useMemo(() => {
    if (activeChannel == null) {
      return null;
    }

    const url = new URL(settings.url);
    const protocol = url.protocol === "https:" ? "iptvs:" : "iptv:";
    const optionalPort = url.port ? `:${url.port}` : "";
    return `${protocol}//${url.hostname}${optionalPort}/live/${settings.username}/${settings.password}/${activeChannel.stream_id}.m3u8`;
  }, [activeChannel, settings]);

  const filteredCategories = React.useMemo(() => {
    if (!categorySearchText) {
      return categories;
    }
    const search = categorySearchText.toLowerCase();
    return categories.filter((e) =>
      e.category_name.toLowerCase().includes(search)
    );
  }, [categories, categorySearchText]);

  const filteredChannels = React.useMemo(() => {
    if (!channelSearchText) {
      return channels;
    }
    const search = channelSearchText.toLowerCase();
    return channels.filter((e) => e.name.toLowerCase().includes(search));
  }, [channels, channelSearchText]);

  React.useEffect(() => {
    setChannelSearchText("");
  }, [activeCategory]);

  const reloadPage = React.useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      <div className="root">
        <div className="root-inner">
          <div className="side-nav-1">
            <div className="side-nav-content-wrapper">
              <div className="side-nav-search-wrapper">
                <SearchBox
                  placeholder="Search"
                  value={categorySearchText}
                  onChange={(_, value) => {
                    setCategorySearchText(value);
                  }}
                />
              </div>
              <div className="side-nav-list scroll" data-is-scrollable>
                {loadingCategories ? (
                  <div className="spinner-wrapper">
                    <Spinner />
                  </div>
                ) : (
                  <CategoriesList
                    items={filteredCategories}
                    selectedCategory={activeCategory}
                    onItemSelected={setActiveCategory}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={`side-nav-2 ${activeCategory ? "" : "hidden"}`}>
            <div className="side-nav-content-wrapper">
              <div className="side-nav-search-wrapper">
                <SearchBox
                  placeholder="Search"
                  value={channelSearchText}
                  onChange={(_, value) => {
                    setChannelSearchText(value);
                  }}
                />
              </div>
              <div className="side-nav-list scroll" data-is-scrollable>
                {loadingChannels ? (
                  <div className="spinner-wrapper">
                    <Spinner />
                  </div>
                ) : (
                  <ChannelsList
                    items={filteredChannels}
                    selectedChannel={activeChannel}
                    onItemSelected={setActiveChannel}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="content-wrapper">
            <div className="action-bar-top">
              <div className="action-bar-top--channel-name-wrapper">
                <span className="action-bar-top--channel-name">
                  {activeChannel?.name}
                </span>
              </div>
              <div className="action-bar-top--buttons">
                <IconButton
                  iconProps={{ iconName: "Search" }}
                />
                {/* {activeChannel && (
                  <IconButton iconProps={{ iconName: "FavoriteStar" }} />
                )} */}
                <IconButton
                  iconProps={{ iconName: "Settings" }}
                  onClick={toggleSettingsDialog}
                />
              </div>
            </div>
            {streamUrl && (
              <VideoPlayer
                stream={activeChannel}
                streamUrl={streamUrl}
                onClose={() => setActiveChannel(null)}
              />
            )}
          </div>
        </div>
        <div className="errors">
          {errorLoadingCateogories && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline
              actions={
                <MessageBarButton onClick={reloadPage}>Reload</MessageBarButton>
              }
            >
              {JSON.stringify(errorLoadingCateogories)}
            </MessageBar>
          )}
          {errorLoadingChannels && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline
              actions={
                <MessageBarButton onClick={reloadPage}>Reload</MessageBarButton>
              }
            >
              {JSON.stringify(errorLoadingChannels)}
            </MessageBar>
          )}
        </div>
      </div>
      <SettingsDialog
        open={settingsDialogVisible || !validSettings}
        onDismiss={toggleSettingsDialog}
      />
    </>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);
