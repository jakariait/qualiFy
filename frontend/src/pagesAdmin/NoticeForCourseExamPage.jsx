import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import CourseExamNoticeManager from "../component/componentAdmin/CourseExamNoticeManager.jsx";

const NoticeForCourseExamPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="NOTICE" title="Notice Management" />
      <CourseExamNoticeManager/>
    </LayoutAdmin>
  );
};

export default NoticeForCourseExamPage;