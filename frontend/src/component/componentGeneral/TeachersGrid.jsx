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
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Meet Our <span className="text-green-600">Faculty</span>
        </h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Our dedicated and highly qualified educators are here to guide and
          inspire the next generation of leaders. Learn from the best in their
          fields.
        </p>
      </div>

      {teachers.length === 0 ? (
        <p className="text-center text-gray-500">No teacher profiles found.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
            >
              <div className="relative">
                <ImageComponent
                  imageName={teacher.teachersImg}
                  altName={teacher.name}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {teacher.name}
                </h3>
                <p className="text-green-600 font-medium mt-1">
                  {teacher.title}
                </p>
                <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                  {teacher.bio.length > 120
                    ? teacher.bio.substring(0, 120) + "..."
                    : teacher.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeachersGrid;
