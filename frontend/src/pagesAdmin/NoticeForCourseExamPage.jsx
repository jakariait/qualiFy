import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import CourseExamNoticeManager from "../component/componentAdmin/CourseExamNoticeManager.jsx";
import NoticeManager from "../component/componentAdmin/NoticeManager.jsx";

const NoticeForCourseExamPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="NOTICE" title="Notice Management" />
      <div className={"space-y-10"}>
        <NoticeManager/>
        <CourseExamNoticeManager/>
      </div>

    </LayoutAdmin>
  );
};

export default NoticeForCourseExamPage;