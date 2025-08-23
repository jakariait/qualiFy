import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";

const UserProtectedRoute = () => {
  const { token } = useAuthUserStore(); // Check if admin is logged in
  const location = useLocation();

  let message;
  if (location.pathname.includes("checkout")) {
    message = "Please sign in to purchase.";
  } else if (location.pathname.includes("free-resource")) {
    message = "Please sign in to view free resources.";
  } else {
    message = "Please sign in to purchase or view free resources.";
  }

  return token ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{
        from: location,
        message: message,
      }}
      replace
    />
  );
};

export default UserProtectedRoute;
