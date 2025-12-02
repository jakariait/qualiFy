import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import axios from "axios";

const PrebookCountBadge = ({ prebook, productId }) => {
  const [apiCount, setApiCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (productId) {
      axios
        .get(`${API_URL}/pre-book/product/${productId}/count`)
        .then((res) => {
          setApiCount(res.data.count || 0);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch prebook count:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [productId, API_URL]);

  const totalEnrolled = prebook + apiCount;

  return (
    totalEnrolled > 0 && (
      <span className="flex items-center gap-1 primaryTextColor">
        <GraduationCap className="w-4 h-4 text-indigo-600" />
        Pre-Booked: {loading ? "Loading..." : totalEnrolled}
      </span>
    )
  );
};

export default PrebookCountBadge;
