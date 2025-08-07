import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductList from "./ProductList.jsx";

const SimilarProducts = ({ type, productId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/similar/${type}/${productId}`);
        if (res.data.success) {
          setSimilarProducts(res.data.data);
        } else {
          setError(res.data.message || "No similar products found");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (type && productId) {
      fetchSimilarProducts();
    }
  }, [type, productId]);

  // ⛔ Don't render anything if there's no error, not loading, and no products
  if (!loading && !error && similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="xl:container xl:mx-auto md:p-3 mt-8">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
        {type === "course" ? (
          <>
            Explore More{" "}
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
          </>
        ) : (
          <>
            You May Also{" "}
            <span className="relative inline-block primaryTextColor">
              Like
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
          </>
        )}
      </h2>

      {/* Show loading skeleton */}
      {loading && <ProductList products={[]} loading={true} />}

      {/* Show error message */}
      {error && (
        <p className="text-center text-red-600 py-10">
          Failed to load similar products: {error}
        </p>
      )}

      {/* Show product list if data exists */}
      {!loading && !error && similarProducts.length > 0 && (
        <ProductList products={similarProducts} loading={false} />
      )}
    </div>
  );
};

export default SimilarProducts;
