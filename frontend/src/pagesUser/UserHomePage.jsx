import React from "react";
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import UserStats from "../component/componentGeneral/UserStats.jsx";
import RecentOrders from "../component/componentGeneral/RecentOrders.jsx";
import DeliveredProducts from "../component/componentGeneral/DeliveredProducts.jsx";
import useAuthUserStore from "../store/AuthUserStore.js";

const UserHomePage = () => {
  const { user, token } = useAuthUserStore();


  return (
    <UserLayout>
      <UserStats />
      <DeliveredProducts userId={user?._id} token={token} />
    </UserLayout>
  );
};

export default UserHomePage;
