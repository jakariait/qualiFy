import React from 'react';
import CheckoutHeader from "./CheckoutHeader.jsx";
import useAuthUserStore from "../../store/AuthUserStore.js";

const Prebook = () => {
  const { user } = useAuthUserStore();

  return (
    <div className="xl:container xl:mx-auto p-4">
      <CheckoutHeader user={user} page={"prebook"} />

    </div>
  );
};

export default Prebook;