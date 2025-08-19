import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";

const UserProtectedRoute = () => {
  const { token } = useAuthUserStore(); // Check if admin is logged in
  const location = useLocation();

  return token ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{
        from: location,
        message: "Please sign in to purchase or view free resources.",
      }}
      replace
    />
  );
};

export default UserProtectedRoute;
