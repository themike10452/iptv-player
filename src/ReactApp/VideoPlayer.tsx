import React from "react";
import ReactPlayer from "react-player";
import { Callout, IconButton, Slider } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { addDays, addHours, addMilliseconds, differenceInMinutes, format, isSameDay, startOfHour } from "date-fns";
import { useSettings } from "./Settings";
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
	
	const [playing, { toggle: togglePlaying }] = useBoolean(true);
	const [volume, setVolume] = React.useState(1);

  const rangeStart = startOfHour(new Date());
  const progress = differenceInMinutes(new Date(), rangeStart);

  const playerRef = React.useRef<ReactPlayer>(null);
  const [seekMax, setSeekMax] = React.useState(60);
  const [seekPos, setSeekPos] = React.useState(0);

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === '\u0014') {
        console.log({
          currentTime: playerRef.current?.getCurrentTime(),
          duration: playerRef.current?.getDuration(),
          player: playerRef.current?.getInternalPlayer(),
          ref: playerRef.current,
        })
      }
    }

    function eachSecond() {
      const duration = playerRef.current?.getDuration() ?? 0;
      const time = Math.round(playerRef.current?.getCurrentTime() ?? 0);

      setSeekMax(duration);
      setSeekPos(time);
    }

    const h = setInterval(eachSecond, 1000);
    window.addEventListener("keypress", handler);

    return () => {
      window.removeEventListener("keypress", handler);
      clearInterval(h);
    }
  }, []);

  const timeshiftSupported = stream.tv_archive === 1;

  const [timeshiftCalloutVisible, { toggle: toggleTimeshiftCallout, setFalse: hideTimeshiftCallout }] = useBoolean(false);

  React.useEffect(() => {
    hideTimeshiftCallout();
  }, [stream, hideTimeshiftCallout]);

  return (
    <div className="video-player-wrapper">
      {/* <ReactPlayer
        url={url}
        volume={volume}
        playing={playing}
        width="100%"
        height="100%"
        ref={playerRef}
        config={{
          file: {
            // forceHLS: true,
            forceAudio: true,
            forceVideo: true,
            forceDASH: true,
          }
        }}
      /> */}
      <VideoJS streamUrl={url} />
      <div className="player-controls">
        <IconButton
          toggle
          onClick={togglePlaying}
          iconProps={{ iconName: playing ? "Pause" : "Play" }}
        />
        <Slider
          max={1}
          step={0.05}
          value={volume}
          onChange={setVolume}
          showValue={false}
          className="player-volume-bar"
        />
        <Slider
          step={1}
          max={seekMax}
          defaultValue={seekPos}
          value={seekPos}
          showValue={true}
          className="player-seekbar"
          onChange={(val) => {
            playerRef.current?.seekTo(val);
          }}
        />
        <IconButton iconProps={{ iconName: "ChevronDown" }} onClick={() => {
          alert(JSON.stringify(stream, null, "  "));
        }} />
        {timeshiftSupported && (
          <>
            <IconButton
              id="timeshift-menu"
              iconProps={{ iconName: "ChevronUp" }}
              onClick={toggleTimeshiftCallout}
            />
            <Callout target="#timeshift-menu" hidden={!timeshiftCalloutVisible}>
              <TimeshiftMenu
                stream={stream}
                setVideoUrl={setUrl}
                hideMenu={hideTimeshiftCallout}
              />
            </Callout>
          </>
        )}
        <IconButton
          iconProps={{ iconName: "OpenInNewWindow" }}
          onClick={() => {
            if (!document.pictureInPictureElement) {
              document.querySelector("video")?.requestPictureInPicture();
            } else {
              document.exitPictureInPicture();
            }
          }}
        />
        <IconButton
          iconProps={{ iconName: "FullScreen" }}
          onClick={() => {
            if (!document.fullscreenElement) {
              document
                .querySelector(".video-player-wrapper")
                ?.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
        />
        <IconButton
          iconProps={{ iconName: "Cancel" }}
          onClick={onClose}
        />
      </div>
    </div>
  );
};
