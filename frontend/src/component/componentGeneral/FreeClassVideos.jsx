import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function extractYouTubeID(url) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

const FreeClassVideos = ({ limit, showViewAll }) => {
  const [videos, setVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/freeclass`)
      .then((res) => {
        if (res.data.success) {
          setVideos(res.data.data);
        } else {
          setError("Failed to fetch videos");
        }
      })
      .catch(() => {
        setError("Error fetching videos");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading videos...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const videosToShow = limit ? videos.slice(0, limit) : videos;

  if (limit && videosToShow.length === 0) {
    return null;
  }

  return (
    <section className="xl:container md:mx-auto p-4 md:p-6">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            Watch Our{" "}
            <span className="relative inline-block primaryTextColor">
              Free Class
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

          {!showViewAll && (
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Experience expert-led free classes designed to boost your skills
              and confidence. Learn at your own pace with real-world examples
              and practical insights.
            </p>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 gap-2">
        {videosToShow.map(({ _id, youtubeUrl }) => {
          const videoId = extractYouTubeID(youtubeUrl);
          if (!videoId) return null;
          return (
            <div
              key={_id}
              className="aspect-video rounded overflow-hidden shadow-lg"
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          );
        })}
      </div>

      {/* View All button */}
      {showViewAll && videos.length > limit && (
        <div className="text-center mt-6">
          <Link
            to="/free-class"
            className="inline-block primaryBgColor accentTextColor px-6 py-2 rounded-lg"
          >
            View All Free Classes
          </Link>
        </div>
      )}
    </section>
  );
};

export default FreeClassVideos;
