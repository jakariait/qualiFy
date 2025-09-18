import React from "react";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import TeacherProfileManager from "../component/componentAdmin/TeacherProfileManager.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const InstructorInfoPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb title={"Instructor"} pageDetails={"WEBSITE CONFIG"} />
      <RequirePermission permission="instructor">
        <TeacherProfileManager />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default InstructorInfoPage;
