import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageComponent from "./ImageComponent.jsx";

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

  if (!deliveredProducts.length) {
    return null;
  }

  return (
    <section className="shadow rounded-xl p-4">
      <h2 className="text-2xl font-bold mb-4">
        Purchased Books & Courses (Total Items Bought: {totalQuantityPurchased})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {deliveredProducts.map(({ product, quantity, orderNo, orderDate }) => (
          <li
            key={`${product._id}-${orderNo}`}
            className="flex-col gap-4 rounded shadow-sm"
          >
            <ImageComponent
              imageName={product.thumbnailImage}
              altName={product.name}
              showSkeleton={false}
              className={"aspect-square object-contain"}
            />

            <div className="flex flex-col px-4 py-4 justify-between">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>
                <strong>Type:</strong>{" "}
                {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
              </p>
              {product.type === "book" && (
                <p>
                  <strong>Quantity:</strong> {quantity}
                </p>
              )}

              <p>
                <strong>Order No:</strong> {orderNo}
              </p>
              <p>
                <strong>Purchased:</strong>{" "}
                {new Date(orderDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Price:</strong> Tk.
                {product.finalDiscount > 0
                  ? product.finalDiscount
                  : product.finalPrice}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DeliveredProducts;
