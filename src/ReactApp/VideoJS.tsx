import React from "react";
import videojs from "video.js";

interface IVideoJsProps {
  streamUrl: string;
}

export const VideoJS: React.FC<IVideoJsProps> = (props) => {
  const { streamUrl } = props;

  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);

  const options = React.useMemo(() => {
    return {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          src: streamUrl,
        },
      ],
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    };
  }, [streamUrl]);

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, options);
    } else {
      const player = playerRef.current;
      player.src(options.sources);
      player.autoplay(options.autoplay);
    }
  }, [options, videoRef]);

  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div className="videojs-container" ref={videoRef}></div>
  );
}
