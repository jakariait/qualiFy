import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useProductStore from "../../store/useProductStore.js";
import ProductList from "./ProductList.jsx";

const AllLiveExam = ({ limit, showViewAll }) => {
  const { exams, fetchExams, loadingExams } = useProductStore();

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const displayedExams = limit ? exams.slice(0, limit) : exams;

  // If limit is active and there are no exams to show, render nothing
  if (limit && displayedExams.length === 0) {
    return null;
  }

  return (
    <section className="xl:container md:mx-auto p-4 md:p-6">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            Explore Our{" "}
            <span className="relative inline-block primaryTextColor">
              Live Exam
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
              Prepare for success with our comprehensive live exam system,
              designed to help you excel in university admission tests. Practice
              in real exam conditions, track your progress, and boost your
              confidence with expert-crafted questions and instant feedback.
            </p>
          )}
        </div>
      </div>

      {/* 📚 Exam List */}
      <ProductList products={displayedExams} loading={loadingExams} />

      {/* View All button */}
      {showViewAll && (
        <div className="text-center mt-6">
          <Link
            to="/live-exam"
            className="inline-block bg-primary primaryBgColor accentTextColor px-6 py-2 rounded-lg"
          >
            View All Live Exams
          </Link>
        </div>
      )}
    </section>
  );
};

export default AllLiveExam;
