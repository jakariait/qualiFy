import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";
import LoginForm from "../component/componentGeneral/LoginForm.jsx";
import { useLocation } from "react-router-dom";

const LoginPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <Layout>
      <LoginForm message={message} />
    </Layout>
  );
};

export default LoginPage;
