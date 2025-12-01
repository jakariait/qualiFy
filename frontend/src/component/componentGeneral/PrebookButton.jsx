import React from "react";
import useCartStore from "../../store/useCartStore.js";
import { useNavigate } from "react-router-dom";

const PrebookButton = ({ product, quantity }) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  return (
    <button
      className="bg-green-600 accentTextColor cursor-pointer px-3 py-2 rounded w-full"
      onClick={() => {
        addToCart(product, quantity);
        navigate("/pre-book");
      }}
    >
      Prebook
    </button>
  );
};

export default PrebookButton;
