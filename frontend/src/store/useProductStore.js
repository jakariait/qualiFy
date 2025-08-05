import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./AuthAdminStore";

const apiUrl = import.meta.env.VITE_API_URL;

const useProductStore = create((set) => ({
  product: null,
  products: [],
  loading: false,
  error: null,

  // ✅ Fetch a single product by ID
  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${apiUrl}/products/${id}`);
      set({ product: response.data?.data || null, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch product",
        loading: false,
      });
    }
  },

  // ✅ Fetch a product by slug
  fetchProductBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${apiUrl}/products/slug/${slug}`);
      set({ product: response.data?.data || null, loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch product by slug",
        loading: false,
      });
    }
  },

  // ✅ Fetch filtered products by type and isActive
  fetchFilteredProducts: async ({ type = "", isActive = "" } = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append("type", type);
      if (isActive !== "") queryParams.append("isActive", isActive);

      const response = await axios.get(`${apiUrl}/products?${queryParams}`);
      set({ products: response.data?.data || [], loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch products",
        loading: false,
      });
    }
  },

  // ✅ Delete a product
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized: No token found");

      await axios.delete(`${apiUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        products: state.products.filter((prod) => prod._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete product",
        loading: false,
      });
    }
  },
}));

export default useProductStore;
