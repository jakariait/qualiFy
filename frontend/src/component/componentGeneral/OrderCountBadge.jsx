import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraduationCap } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const OrderCountBadge = ({ productId, enrolledStudents = 0 }) => {
  const [orderCount, setOrderCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/products/${productId}/order-count`,
        );
        const count = res?.data?.data?.count || 0;
        setOrderCount(count);
      } catch (err) {
        setError("Failed to load order count");
        console.error(err);
      }
    };

    if (productId) fetchOrderCount();
  }, [productId]);

  const totalEnrolled = enrolledStudents + orderCount;

  if (error) return <span className="text-red-500">{error}</span>;

  return (
    <span className="flex items-center gap-1">
      <GraduationCap className="w-4 h-4 text-indigo-600" />
      Enrolled: {isNaN(totalEnrolled) ? "Loading..." : totalEnrolled}
    </span>
  );
};

export default OrderCountBadge;
