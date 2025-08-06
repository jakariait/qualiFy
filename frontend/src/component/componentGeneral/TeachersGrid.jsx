import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageComponent from "./ImageComponent.jsx";

const TeachersGrid = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

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
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading teachers...</div>
    );
  }

  return (
    <section className="xl:container md:mx-auto p-3">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl  font-extrabold  mb-6 leading-tight">
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

          <p className="text-base md:text-lg  max-w-2xl mx-auto leading-relaxed">
            Be guided by experienced university admission mentors who inspire
            success and shape future scholars.
          </p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <p className="text-center ">No teacher profiles found.</p>
      ) : (
        <div className="grid grid-cols-1  md:grid-cols-3 gap-2">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group "
            >
              <div className="relative">
                <ImageComponent
                  imageName={teacher.teachersImg}
                  altName={teacher.name}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="py-3 text-center">
                <h3 className="text-xl font-semibold primaryTextColor">
                  {teacher.name}
                </h3>
                <p className="primaryTextColor">{teacher.teacherUniversity}</p>
                <p className="primaryTextColor font-medium">{teacher.title}</p>
                <p className=" mt-4 p-3 text-md">{teacher.bio}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeachersGrid;
