import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import ExamList from "../component/componentAdmin/ExamList.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const ExamListPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="EXAM" title="Exam Management" />
      <RequirePermission permission="exam">
        <div className={"space-y-4"}>
          <ExamList />
        </div>
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default ExamListPage;
