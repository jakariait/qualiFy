import React from "react";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import StudentReviwUpload from "../component/componentAdmin/StudentReviwUpload.jsx";

const StudentReviewPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb title={"Student Review"} pageDetails={"WEBSITE CONFIG"} />
      <StudentReviwUpload />
    </LayoutAdmin>
  );
};

export default StudentReviewPage;
