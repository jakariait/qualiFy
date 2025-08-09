import React from "react";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ProductCRUD from "../component/componentAdmin/ProductCRUD.jsx";

const ManageProductServicePage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb
        pageDetails="PRODUCT & SERVICES"
        title="Manage Product & Service"
      />
      <ProductCRUD />
    </LayoutAdmin>
  );
};

export default ManageProductServicePage;
