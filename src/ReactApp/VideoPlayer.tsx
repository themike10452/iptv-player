import { IconButton, Slider } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import React from "react";
import ReactPlayer from "react-player";

interface IVideoPlayerProps {
	streamUrl: string;
	onClose?: () => void;
}

export const VideoPlayer: React.FC<IVideoPlayerProps> = (props) => {
	const { streamUrl, onClose } = props;
	
	const [playing, { toggle: togglePlaying }] = useBoolean(true);
	const [volume, setVolume] = React.useState(1);
	
  return (
    <div className="video-player-wrapper">
      <ReactPlayer
        url={streamUrl}
        volume={volume}
        playing={playing}
        // controls
        // pip
        width="100%"
        height="100%"
      />
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
          max={100}
          step={1}
          defaultValue={0}
          showValue={false}
          className="player-seekbar"
        />
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
