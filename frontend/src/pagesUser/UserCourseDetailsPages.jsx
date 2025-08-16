import React from 'react';
import UserLayout from "../component/componentGeneral/UserLayout.jsx";
import LiveExamList from "../component/componentGeneral/LiveExamList.jsx";

const UserCourseDetailsPages = () => {
  return (
    <UserLayout>
      <LiveExamList />
    </UserLayout>
  );
};

export default UserCourseDetailsPages;