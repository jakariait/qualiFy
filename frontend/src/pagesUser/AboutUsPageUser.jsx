import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";

import PublicContentViewer from "../component/componentGeneral/PublicContentViewer.jsx";
import TeachersGrid from "../component/componentGeneral/TeachersGrid.jsx";

const HomePage = () => {
  return (
    <Layout>
      <PublicContentViewer
        title="About Us"
        endpoint="about"
      />
      <TeachersGrid/>
    </Layout>
  );
};

export default HomePage;
