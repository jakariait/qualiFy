import React from "react";

const SelfHostedVideo = ({
                           src,
                           width = "100%",
                           height = "480",
                           autoplay = true,
                           loop = true,
                           muted = false,
                           controls = true,
                         }) => {
  if (!src) return null; // Return null if no video source

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        height: 0,
        overflow: "hidden",
      }}
    >
      <video
        src={src}
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default SelfHostedVideo;
