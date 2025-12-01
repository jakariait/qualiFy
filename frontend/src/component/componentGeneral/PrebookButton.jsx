import React from "react";
import { useNavigate } from "react-router-dom";

const PrebookButton = ({ product, quantity }) => {
  const navigate = useNavigate();

  return (
    <button
      className="bg-green-600 accentTextColor cursor-pointer px-3 py-2 rounded w-full"
      onClick={() => {
        navigate("/pre-book", { state: { product, quantity } });
      }}
    >
      Prebook
    </button>
  );
};

export default PrebookButton;
