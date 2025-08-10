import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./AuthAdminStore";

const apiUrl = import.meta.env.VITE_API_URL;

const useProductStore = create((set) => ({
  product: null,

  books: [],
  loadingBooks: false,
  errorBooks: null,

  courses: [],
  loadingCourses: false,
  errorCourses: null,

  // Fetch books
  fetchBooks: async () => {
    set({ loadingBooks: true, errorBooks: null });
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("type", "book");
      queryParams.append("isActive", "true");

      const response = await axios.get(`${apiUrl}/products?${queryParams}`);
      set({ books: response.data?.data || [], loadingBooks: false });
    } catch (error) {
      set({
        errorBooks: error.response?.data?.message || "Failed to fetch books",
        loadingBooks: false,
      });
    }
  },

  // Fetch courses
  fetchCourses: async () => {
    set({ loadingCourses: true, errorCourses: null });
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("type", "course");
      queryParams.append("isActive", "true");

      const response = await axios.get(`${apiUrl}/products?${queryParams}`);
      set({ courses: response.data?.data || [], loadingCourses: false });
    } catch (error) {
      set({
        errorCourses:
          error.response?.data?.message || "Failed to fetch courses",
        loadingCourses: false,
      });
    }
  },

  // Other methods unchanged...
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

  resetProduct: () => set({ product: null, loading: false, error: null }),

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized: No token found");

      await axios.delete(`${apiUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        books: state.books.filter((prod) => prod._id !== id),
        courses: state.courses.filter((prod) => prod._id !== id),
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
