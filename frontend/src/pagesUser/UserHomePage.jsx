import React from "react";
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import UserStats from "../component/componentGeneral/UserStats.jsx";
import DeliveredProducts from "../component/componentGeneral/DeliveredProducts.jsx";
import useAuthUserStore from "../store/AuthUserStore.js";
import LiveExamList from "../component/componentGeneral/LiveExamList.jsx";

const UserHomePage = () => {
  const { user, token } = useAuthUserStore();

  return (
    <UserLayout>
      <UserStats />
      <LiveExamList />
      <DeliveredProducts userId={user?._id} token={token} />
    </UserLayout>
  );
};

export default UserHomePage;
