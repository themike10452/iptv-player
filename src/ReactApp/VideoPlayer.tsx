import React from "react";
import ReactPlayer from "react-player";
import { Callout, IconButton, Slider } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { addDays, addHours, addMilliseconds, differenceInMinutes, format, isSameDay, startOfHour } from "date-fns";
import { useSettings } from "./Settings";
import { VideoJS } from "./VideoJS";

interface IVideoPlayerProps {
  stream: LiveStream;
	streamUrl: string;
	onClose?: () => void;
}

interface TimeshiftOption {
  title: string;
  from: Date;
  fromFormatted: string;
  to: Date;
  toFormatted: string;
  duration: number;
}

export const VideoPlayer: React.FC<IVideoPlayerProps> = (props) => {
  const { settings } = useSettings();
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

  const timeshiftOptions = React.useMemo(() => {
    const now = new Date();
    const minDate = startOfHour(addDays(now, -3));

    const options: TimeshiftOption[] = [];

    for (let date = startOfHour(new Date()); date >= minDate; date = addHours(date, -1)) {
      const from = date;
      const to = addMilliseconds(addHours(from, 1), -1);

      const title = isSameDay(from, now)
        ? `${format(from, "hh:mm:ss a")} - ${format(to, "hh:mm:ss a")}`
        : `${format(from, "E MMM dd hh:mm:ss a")} - ${format(to, "E MMM dd hh:mm:ss a")}`;

      options.push({
        title,
        from,
        fromFormatted: format(from, "HH:mm:ss"),
        to,
        toFormatted: format(to, "HH:mm:ss"),
        duration: 60,
      });
    }

    return options;
  }, []);

  const onClickTimeshiftOption = React.useCallback((e: TimeshiftOption) => {
    const ts = format(e.from, `yyyy-MM-dd:HH-mm-ss`);
    console.log(stream);
    // setUrl(`${settings.url}/timeshift/${settings.username}/${settings.password}/${e.duration}/${ts}/${stream.stream_id}.m3u8`.replace("http", "iptv"));
    setUrl(`${settings.url}/timeshift/${settings.username}/${settings.password}/${e.duration}/${ts}/${stream.stream_id}.m3u8`);
  }, [settings, stream]);

  const onClickBackToLiveOption = React.useCallback(() => {
    setUrl(streamUrl);
  }, [streamUrl]);

  const [timeshiftCalloutVisible, { toggle: toggleTimeshiftCallout }] = useBoolean(false);

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
              <div
                style={{
                  width: 400,
                  height: 300,
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <div style={{ padding: 8 }} onClick={onClickBackToLiveOption}>Live</div>
                {timeshiftOptions.map((e, idx) => (
                  <div key={idx} style={{ padding: 8 }} onClick={() => onClickTimeshiftOption(e)}>{e.title}</div>
                ))}
              </div>
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
