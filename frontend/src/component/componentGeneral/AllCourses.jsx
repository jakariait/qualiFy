import React, { useEffect } from "react";
import useProductStore from "../../store/useProductStore.js";
import ProductList from "./ProductList.jsx";
import { GraduationCap } from "lucide-react"; // Optional icon

const AllCourses = () => {
  const { products, fetchFilteredProducts, loading } = useProductStore();

  useEffect(() => {
    fetchFilteredProducts({ type: "course", isActive: "true" });
  }, []);

  return (
    <section className="xl:container md:mx-auto p-4 md:p-6">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-4xl md:text-5xl  font-extrabold   mb-6 leading-tight">
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
          <p className="text-base md:text-lg  max-w-2xl mx-auto leading-relaxed">
            Enhance your skills with our expertly crafted courses designed to
            help you grow personally and professionally. Learn at your own pace
            from experienced instructors.
          </p>
        </div>
      </div>
      {/* 📚 Course List */}
      <ProductList products={products} />
    </section>
  );
};

export default AllCourses;
