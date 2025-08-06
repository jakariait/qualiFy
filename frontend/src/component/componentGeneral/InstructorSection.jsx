import React from "react";
import { GraduationCap } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InstructorSection = ({ instructors = [], loading }) => {
  const skeletonCards = Array(3).fill(null); // Adjust based on desired count

  if (!loading && !instructors.length) return null;

  return (
    <div className="py-5">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-center">
        Meet Our{" "}
        <span className="relative inline-block primaryTextColor">
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

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? skeletonCards.map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
              >
                <div className="flex gap-4 items-center">
                  <Skeleton circle width={80} height={80} />
                  <div className="flex flex-col gap-2 flex-grow">
                    <Skeleton width="70%" height={20} />
                    <Skeleton width="50%" height={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <Skeleton width="60%" height={18} />
                </div>
              </div>
            ))
          : instructors.map((instructor) => (
              <div
                key={instructor._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-3 flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-4 w-full">
                  {/* Instructor Image */}
                  <img
                    src={`${import.meta.env.VITE_API_URL.replace(
                      "/api",
                      "",
                    )}/uploads/${instructor.teachersImg}`}
                    alt={instructor.name}
                    className="w-20 h-20 object-cover rounded-full shadow-md"
                  />

                  {/* Name and Title */}
                  <div className="text-left">
                    <h3 className="text-lg primaryTextColor font-semibold">
                      {instructor.name}
                    </h3>
                    <p className="text-sm secondaryTextColor">
                      {instructor.title}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 mt-3 w-full" />

                {/* University */}
                <div className="flex items-center gap-1 text-sm text-gray-700 mt-4">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="secondaryTextColor">
                    {instructor.teacherUniversity}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default InstructorSection;
