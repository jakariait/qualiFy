import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useProductStore from "../../store/useProductStore.js";
import ProductList from "./ProductList.jsx";

const AllCourses = ({ limit, showViewAll }) => {
  const { courses, fetchCourses, loadingCourses } = useProductStore();

  useEffect(() => {
    fetchCourses();
  }, []);

  const displayedCourses = limit ? courses.slice(0, limit) : courses;

  if (limit && displayedCourses.length === 0) {
    return null;
  }

  return (
    <section className="xl:container md:mx-auto p-4 md:p-6">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            Explore Our{" "}
            <span className="relative inline-block primaryTextColor">
              Courses
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
              Enhance your skills with our expertly crafted courses designed to
              help you grow personally and professionally. Learn at your own pace
              from experienced instructors.
            </p>
          )}
        </div>
      </div>

      <ProductList products={displayedCourses} loading={loadingCourses} />

      {showViewAll && (
        <div className="text-center mt-6">
          <Link
            to="/courses"
            className="inline-block bg-primary primaryBgColor accentTextColor px-6 py-2 rounded-lg"
          >
            View All Courses
          </Link>
        </div>
      )}
    </section>
  );
};

export default AllCourses;
