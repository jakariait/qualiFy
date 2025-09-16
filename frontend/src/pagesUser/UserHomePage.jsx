import React from "react";
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import UserStats from "../component/componentGeneral/UserStats.jsx";
import DeliveredProducts from "../component/componentGeneral/DeliveredProducts.jsx";
import useAuthUserStore from "../store/AuthUserStore.js";
import FreeLiveExamList from "../component/componentGeneral/FreeLiveExam.jsx";
import ActiveNotices from "../component/componentGeneral/ActiveNotices.jsx";

const UserHomePage = () => {
  const { user, token } = useAuthUserStore();

  console.log(user);

  return (
    <UserLayout>
      <UserStats />
      <div className={"flex flex-col gap-4"}>
        <ActiveNotices/>
        <DeliveredProducts userId={user?._id} token={token} />
        <FreeLiveExamList />
      </div>
    </UserLayout>
  );
};

export default UserHomePage;
