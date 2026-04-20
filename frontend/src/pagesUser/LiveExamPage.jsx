import React from 'react';
import { useParams } from 'react-router-dom';
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import ExamLayout from "../component/componentGeneral/ExamLayout.jsx";
import LiveExam from "../component/componentGeneral/LiveExam.jsx";
import LiveExamList from '../component/componentGeneral/LiveExamList.jsx';

const LiveExamPage = () => {
  const { id, attemptId } = useParams();

  if (id) {
    return <UserLayout><LiveExamList /></UserLayout>;
  }

  return <ExamLayout><LiveExam /></ExamLayout>;
};

export default LiveExamPage;
