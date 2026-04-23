import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import AdminPathaoConfig from "../component/componentAdmin/AdminPathaoConfig.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const PathaoConfigPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="PROMO CODE" title="View and Create Promo Code" />
      <RequirePermission permission="pathao_api">
        <AdminPathaoConfig />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default PathaoConfigPage;
