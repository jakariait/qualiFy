import React from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import CourseExamNoticeManager from "../component/componentAdmin/CourseExamNoticeManager.jsx";
import NoticeManager from "../component/componentAdmin/NoticeManager.jsx";
import RequirePermission from "../component/componentAdmin/RequirePermission.jsx";

const NoticeForCourseExamPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="NOTICE" title="Notice Management" />

      <RequirePermission permission="notice">
        <div className={"space-y-10"}>
          <NoticeManager />
          <CourseExamNoticeManager />
        </div>
      </RequirePermission>
    </LayoutAdmin>
  );
};

export default NoticeForCourseExamPage;
