import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import PlatformInfoUpdate from "../component/componentAdmin/PlatformInfoUpdate.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const PlatformInfoPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb
        title={"Update Platform Info"}
        pageDetails={"PLATFORM INFO"}
      />
      <RequirePermission permission="platform">
        <PlatformInfoUpdate />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default PlatformInfoPage;
