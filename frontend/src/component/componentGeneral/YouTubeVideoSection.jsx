import React from "react";

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const YouTubeVideoSection = ({ videos = [] }) => {

  console.log(videos);


  if (!Array.isArray(videos) || videos.length === 0) return null;

  return (
    <div className="">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-center">
        Course{" "}
        <span className="relative inline-block primaryTextColor">
          Videos
          <svg
            className="absolute -bottom-2 left-0 w-full h-3"
            viewBox="0 0 200 12"
            fill="none"
          >
            <path
              d="M2 8C2 8 50 2 100 4C150 6 198 8 198 8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="primaryTextColor"
            />
          </svg>
        </span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2  gap-2">
        {videos.map((url, index) => {
          const videoId = extractVideoId(url);
          if (!videoId) return null;

          return (
            <div key={index} className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded shadow"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`YouTube Video ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YouTubeVideoSection;
