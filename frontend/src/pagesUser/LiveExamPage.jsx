import React from 'react';
import { useParams } from 'react-router-dom';
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import LiveExam from "../component/componentGeneral/LiveExam.jsx";
import LiveExamList from '../component/componentGeneral/LiveExamList.jsx';

const LiveExamPage = () => {
  const { id, attemptId } = useParams();

  return (
    <UserLayout>
      {id ? <LiveExamList /> : <LiveExam />}
    </UserLayout>
  );
};

export default LiveExamPage;