import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import ExamList from "../component/componentAdmin/ExamList.jsx";
import ExamResultsList from "../component/componentAdmin/ExamResultsList.jsx";


const ExamListPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="EXAM" title="Exam Management" />
      <div className={"space-y-4"}>
        <ExamList/>
        <ExamResultsList/>
      </div>

    </LayoutAdmin>
  );
};

export default ExamListPage;