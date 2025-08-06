import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ImageComponent from "./ImageComponent.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

const AnimatedScrollableStudentReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const scrollInterval = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getallstudentreview`);
        setReviews(response.data || []);
      } catch (error) {
        console.error("Failed to fetch student reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const startScrolling = () => {
    if (!scrollRef.current || reviews.length === 0) return;
    const scrollContainer = scrollRef.current;
    let scrollSpeed = 1;

    scrollInterval.current = setInterval(() => {
      if (!isPaused.current) {
        scrollContainer.scrollLeft -= scrollSpeed;
        if (scrollContainer.scrollLeft <= 0) {
          scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;
        }
      }
    }, 16); // ~60fps
  };

  const stopScrolling = () => {
    clearInterval(scrollInterval.current);
  };

  useEffect(() => {
    startScrolling();
    return () => stopScrolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading reviews...</div>
    );
  }

  return (
    <section className="xl:container md:mx-auto p-3">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            What Our{" "}
            <span className="relative inline-block primaryTextColor">
              Students Say
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
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Real experiences shared by our students from their admission
            journey.
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center">No reviews found.</p>
      ) : (
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-4 scrollbar-hide"
          style={{
            whiteSpace: "nowrap",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
          onMouseEnter={() => {
            isPaused.current = true;
          }}
          onMouseLeave={() => {
            isPaused.current = false;
          }}
        >
          <div className="flex gap-6 min-w-max">
            {[...reviews, ...reviews].map((review, index) => (
              <div
                key={`${review._id}-${index}`}
                className="rounded-md shadow transition-all duration-300 overflow-hidden group w-72 flex-shrink-0"
              >
                <ImageComponent
                  imageName={review.imgSrc}
                  altName={`Student Review ${index + 1}`}
                  className="w-full  object-cover transition-transform duration-500 rounded-md group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AnimatedScrollableStudentReviews;
