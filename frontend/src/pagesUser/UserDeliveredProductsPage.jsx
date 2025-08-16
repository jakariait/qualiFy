import React from 'react';
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import DeliveredProducts from "../component/componentGeneral/DeliveredProducts.jsx";
import useAuthUserStore from '../store/AuthUserStore.js';

const UserDeliveredProductsPage = () => {
  const { user, token } = useAuthUserStore();
  return (
    <UserLayout>
      <DeliveredProducts userId={user?._id} token={token} />
    </UserLayout>
  );
};

export default UserDeliveredProductsPage;
