import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ImageComponent from "./ImageComponent.jsx";
import { User, Award, Clock, GraduationCap } from "lucide-react";

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
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl heading md:text-4xl  font-extrabold   mb-6 leading-tight">
            Meet Our{" "}
            <span className="relative  heading inline-block primaryTextColor">
              Instructor
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

          <p className="text-base md:text-lg  max-w-2xl mx-auto leading-relaxed">
            Be guided by experienced university admission mentors who inspire
            success and shape future scholars.
          </p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <p className="text-center ">No instructor profiles found.</p>
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
                className="rounded-md shadow transition-all duration-300 overflow-hidden group flex-shrink-0"
                style={{ width: '40vw', maxWidth: '288px' }} // 288px is 72 * 4 (Tailwind w-72)
              >
                <div className="relative">
                  <ImageComponent
                    imageName={teacher.teachersImg}
                    altName={teacher.name}
                    className="w-full object-cover  transition-transform duration-500"
                  />
                </div>

                <div className="py-2 px-2 primaryTextColor text-center flex flex-col items-center justify-center md:text-left">
                  {teacher.name && (
                    <h3 className="text-md md:text-lg font-semibold flex items-center justify-center md:justify-start gap-2">
                      {teacher.name}
                    </h3>
                  )}

                  {teacher.scholarship && (
                    <p className="text-sm md:text-md flex items-center justify-center md:justify-start gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      {teacher.scholarship}
                    </p>
                  )}

                  {teacher.title && (
                    <p className="text-sm md:text-md flex items-center justify-center md:justify-start gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {teacher.title}
                    </p>
                  )}

                  {teacher.teacherUniversity && (
                    <p className="text-sm md:text-md flex items-center justify-center md:justify-start gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      {teacher.teacherUniversity}
                    </p>
                  )}
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
