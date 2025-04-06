import React from "react";
import classNames from "classnames";
import { IconButton } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { VideoJS } from "./VideoJS";
import { TimeshiftMenu } from "./TimeshiftMenu";

interface IVideoPlayerProps {
  stream: LiveStream;
	streamUrl: string;
	onClose?: () => void;
}

export const VideoPlayer: React.FC<IVideoPlayerProps> = (props) => {
	const { streamUrl, stream, onClose } = props;

  const [url, setUrl] = React.useState(streamUrl);
  React.useEffect(() => {
    setUrl(streamUrl);
  }, [streamUrl]);

  const timeshiftSupported = stream.tv_archive === 1;

  const [timeshiftMenuVisible, { toggle: toggleTimeshiftMenu, setFalse: hideTimeshiftMenu }] = useBoolean(false);

  React.useEffect(() => {
    hideTimeshiftMenu();
  }, [stream, hideTimeshiftMenu]);

  return (
    <div className="video-player-outer-wrapper">
      <div className="video-player-inner-wrapper">
        <VideoJS streamUrl={url} />
        <div className="player-controls">
          <IconButton iconProps={{ iconName: "Info" }} onClick={() => {
            alert(JSON.stringify(stream, null, "  "));
          }} />
          {timeshiftSupported && (
            <>
              <IconButton
                iconProps={{ iconName: "FullHistory" }}
                onClick={toggleTimeshiftMenu}
              />
            </>
          )}
          <IconButton
            iconProps={{ iconName: "Cancel" }}
            onClick={onClose}
          />
        </div>
      </div>
      <div className={classNames("side-nav-3", { hidden: !timeshiftMenuVisible })}>
        {timeshiftMenuVisible && (
          <TimeshiftMenu
            stream={stream}
            setVideoUrl={setUrl}
            hideMenu={hideTimeshiftMenu}
          />
        )}
      </div>
    </div>
  );
};
