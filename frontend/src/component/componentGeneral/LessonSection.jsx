import React, { useState } from "react";
import { Clock } from "lucide-react";

const LessonSection = ({ modules }) => {
  const [activeIndex, setActiveIndex] = useState(0); // First module open by default

  if (!Array.isArray(modules) || modules.length === 0) return null;

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="py-5">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-center">
        Course{" "}
        <span className="relative inline-block primaryTextColor">
          Modules & Lessons
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

      <div className="space-y-4">
        {modules.map((module, index) => (
          <div
            key={module._id || index}
            className="border primaryBorderColor rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
              className="w-full text-left px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none"
              onClick={() => toggle(index)}
            >
              <h3 className="text-xl font-semibold primaryTextColor">
                {module.subject}
              </h3>
              <span className="text-2xl text-[#EF6C00]">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>

            {/* Content */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden px-4 ${
                activeIndex === index ? "max-h-[3000px] py-4" : "max-h-0"
              }`}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition group"
                  >
                    {/* Thumbnail */}
                    {lesson.courseThumbnail && (
                      <div className="relative">
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace(
                            "/api",
                            "",
                          )}/uploads/${lesson.courseThumbnail}`}
                          alt={lesson.title}
                          className="w-full object-cover group-hover:scale-102 transition-transform"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-lg font-semibold primaryTextColor">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center text-gray-600 text-sm gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{lesson.duration || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonSection;
