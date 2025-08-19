import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageComponent from "./ImageComponent.jsx";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const SkeletonCard = () => (
  <li className="flex flex-col gap-4 rounded shadow-sm p-4 animate-pulse">
    <div className="bg-gray-300 rounded aspect-square w-full"></div>
    <div className="flex flex-col px-4 py-4 justify-between space-y-3">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
  </li>
);

const DeliveredProducts = ({ userId, token }) => {
  const [data, setData] = useState({
    deliveredProducts: [],
    totalQuantityPurchased: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    axios
      .get(`${API_URL}/delivered-products/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
          setError(null);
        } else {
          setError("Failed to fetch delivered products");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  if (loading)
    return (
      <section className="shadow rounded-xl p-4">
        <h2 className="text-2xl font-bold mb-4 animate-pulse bg-gray-300 rounded w-1/3 h-8"></h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      </section>
    );

  if (error) return <p className="text-red-600">Error: {error}</p>;

  const { deliveredProducts, totalQuantityPurchased } = data;

  const nonBookProducts = deliveredProducts.filter(
    (item) => item.product.type !== "book",
  );

  if (!nonBookProducts.length) {
    return null;
  }

  return (
    <section className="bg-gray-50 shadow-inner rounded-2xl p-3">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-2xl font-semibold">
        Purchased Courses & Exams
      </h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nonBookProducts.map(({ product, orderNo, orderDate }) => (
          <li
            key={`${product._id}-${orderNo}`}
            className="flex gap-4 rounded-xl shadow-md bg-white transition-transform transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="w-36 h-full">
              <ImageComponent
                imageName={product.thumbnailImage}
                altName={product.name}
                showSkeleton={false}
                className={"w-full h-full object-cover"}
              />
            </div>

            <div className="flex flex-col p-4 justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Type:</strong>{" "}
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </p>
              </div>
              <div className="space-y-4 mt-4">
                <Link
                  to={`/user/notice/${product._id}`}
                  className="inline-block primaryBgColor accentTextColor px-4 py-2 rounded-lg text-sm font-semibold  transition-colors shadow-md"
                >
                  View All Notice
                </Link>
                <Link
                  to={`/user/courses/${product._id}/exams`}
                  className="inline-block primaryBgColor accentTextColor px-4 py-2 rounded-lg text-sm font-semibold  transition-colors shadow-md"
                >
                  View All Exams
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DeliveredProducts;
