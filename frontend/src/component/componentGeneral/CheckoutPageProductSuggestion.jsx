import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductList from "./ProductList.jsx";
import useCartStore from '../../store/useCartStore.js';

const CheckoutPageProductSuggestion = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { cart } = useCartStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/products`);
        if (res.data.success) {
          const cartProductIds = cart.map(item => item.productId);
          const filteredProducts = (res.data.data || []).filter(
            product => !cartProductIds.includes(product._id)
          );
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cart, apiUrl]);

  return (
    <div className="xl:container xl:mx-auto md:p-3 mt-8">
      {products.length > 0 && (
        <>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
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
          </h2>
          <ProductList products={products} loading={loading} />
        </>
      )}
    </div>
  );
};

export default CheckoutPageProductSuggestion;