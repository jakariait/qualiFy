import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import FreeClassManager from "../component/componentAdmin/FreeClassManager.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const FreeClassPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="FREE CLASS" title="Manage Free Class" />

      <RequirePermission permission="free_class">
        <FreeClassManager />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default FreeClassPage;
