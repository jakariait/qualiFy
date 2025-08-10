import React, { useEffect } from "react";
import useProductStore from "../../store/useProductStore.js";
import ProductList from "./ProductList.jsx";

const AllBooks = () => {
  const { products, fetchFilteredProducts, loading } = useProductStore();

  useEffect(() => {
    fetchFilteredProducts({ type: "book", isActive: "true" });
  }, []);

  return (
    <section className="xl:container md:mx-auto p-4 md:p-6">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl  font-extrabold   mb-6 leading-tight">
            Explore Our{" "}
            <span className="relative inline-block primaryTextColor">
              Books
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
            Discover a world of knowledge with our carefully selected books that inspire learning and growth. Explore at your own pace and gain wisdom from renowned authors and experts.
          </p>
        </div>
      </div>
      {/* 📚 Course List */}
      <ProductList products={products} loading={loading} />
    </section>
  );
};

export default AllBooks;
