import React, { useEffect } from "react";
import useProductStore from "../../store/useProductStore.js";
import ProductList from "./ProductList.jsx";

const AllCourses = () => {
  const { products, fetchFilteredProducts, loading } = useProductStore();

  useEffect(() => {
    fetchFilteredProducts({ type: "course", isActive: "true" });
  }, []);

  return (
    <div>
      <ProductList products={products} />
    </div>
  );
};

export default AllCourses;
