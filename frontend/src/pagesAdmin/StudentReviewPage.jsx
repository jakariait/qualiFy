import React from "react";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import StudentReviwUpload from "../component/componentAdmin/StudentReviwUpload.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const StudentReviewPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb title={"Student Review"} pageDetails={"WEBSITE CONFIG"} />

      <RequirePermission permission="student-review">
        <StudentReviwUpload />
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default StudentReviewPage;
