import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import ExamResults from "../component/componentAdmin/ExamResults.jsx";

const ViewResultsExamWisePage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="EXAM" title="Exam Management" />
      <ExamResults/>
    </LayoutAdmin>
  );
};

export default ViewResultsExamWisePage;