import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import ExamList from "../component/componentAdmin/ExamList.jsx";


const ExamListPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="EXAM" title="Exam Management" />
      <ExamList/>
    </LayoutAdmin>
  );
};

export default ExamListPage;