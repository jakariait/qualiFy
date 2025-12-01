import React from 'react';
import Layout from "../component/componentGeneral/Layout.jsx";
import Checkout from "../component/componentGeneral/Checkout.jsx";
import Prebook from "../component/componentGeneral/Prebook.jsx";

const PrebookPage = () => {
  return (
    <Layout>
      <Checkout />
      <Prebook/>
    </Layout>
  );
};

export default PrebookPage;