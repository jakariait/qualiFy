import React from "react";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ProductCRUD from "../component/componentAdmin/ProductCRUD.jsx";
import ProductsWithSalesDialog from "../component/componentAdmin/ProductsWithSalesDialog.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";
import ProductWithPrebook from "../component/componentAdmin/ProductWithPrebook.jsx";

const ManageProductServicePage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb
        pageDetails="PRODUCT & SERVICES"
        title="Manage Product & Service"
      />
      <RequirePermission permission="product_service">
        <div className={"space-y-5"}>
          <ProductCRUD />
          <ProductWithPrebook />
          <ProductsWithSalesDialog />
        </div>
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ManageProductServicePage;
