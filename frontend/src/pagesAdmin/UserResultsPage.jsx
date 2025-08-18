import React from 'react';
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import UserResult from "../component/componentAdmin/UserResult.jsx";

const UserResultsPage = () => {
  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="ABOUT US" title="Update About Us" />
      <UserResult/>
    </LayoutAdmin>
  );
};

export default UserResultsPage;