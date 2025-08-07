import React from 'react';
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import TeacherProfileManager from "../component/componentAdmin/TeacherProfileManager.jsx";

const InstructorInfoPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb title={"Instructor"} pageDetails={"WEBSITE CONFIG"} />
      <TeacherProfileManager/>
    </LayoutAdmin>
  );
};

export default InstructorInfoPage;