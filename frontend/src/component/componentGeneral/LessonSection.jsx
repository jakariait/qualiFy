import React from "react";
import { Clock } from "lucide-react";

const LessonSection = ({ modules }) => {
  if (!Array.isArray(modules) || modules.length === 0) return null;

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

      {modules.map((module) => (
        <div key={module._id} className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-left primaryTextColor">
            {module.subject}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {module.lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition group"
              >
                {/* Thumbnail */}
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
      ))}
    </div>
  );
};

export default LessonSection;
