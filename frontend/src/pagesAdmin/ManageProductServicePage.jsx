import React from "react";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import ProductCRUD from "../component/componentAdmin/ProductCRUD.jsx";
import ProductsWithSalesDialog from "../component/componentAdmin/ProductsWithSalesDialog.jsx";
import CourseExamNoticeManager from "../component/componentAdmin/CourseExamNoticeManager.jsx";

const ManageProductServicePage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb
        pageDetails="PRODUCT & SERVICES"
        title="Manage Product & Service"
      />
      <div className={"space-y-5"}>
        <ProductCRUD />
        <ProductsWithSalesDialog/>
        <CourseExamNoticeManager/>
      </div>

    </LayoutAdmin>
  );
};

export default ManageProductServicePage;
