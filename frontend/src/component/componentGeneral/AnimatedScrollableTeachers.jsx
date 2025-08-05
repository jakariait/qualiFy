import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ImageComponent from "./ImageComponent.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

const AnimatedScrollableTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const scrollInterval = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/teacher`);
        setTeachers(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch teachers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const startScrolling = () => {
    if (!scrollRef.current || teachers.length === 0) return;
    const scrollContainer = scrollRef.current;
    let scrollSpeed = 1;

    scrollInterval.current = setInterval(() => {
      if (!isPaused.current) {
        scrollContainer.scrollLeft += scrollSpeed;
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
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
  }, [teachers]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading teachers...</div>
    );
  }

  return (
    <section className="xl:container  md:mx-auto p-3">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold primaryTextColor">
          Meet Our Instructor
        </h2>
        <p className="mt-3  max-w-2xl mx-auto">
          Be guided by experienced university admission mentors who inspire success and shape future scholars.
        </p>
      </div>

      {teachers.length === 0 ? (
        <p className="text-center text-gray-500">No teacher profiles found.</p>
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
          <div className="flex gap-6  min-w-max">
            {[...teachers, ...teachers].map((teacher, index) => (
              <div
                key={`${teacher._id}-${index}`}
                className=" rounded-md shadow  transition-all duration-300 overflow-hidden group w-72 flex-shrink-0"
              >
                <div className="relative">
                  <ImageComponent
                    imageName={teacher.teachersImg}
                    altName={teacher.name}
                    className="w-full object-cover  transition-transform duration-500"
                  />
                </div>
                <div className="py-2 primaryTextColor text-center">
                  <h3 className="text-xl f">{teacher.name}</h3>
                  <p className="">{teacher.teacherUniversity}</p>
                  <p className="">{teacher.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AnimatedScrollableTeachers;
