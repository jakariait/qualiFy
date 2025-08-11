import React, { useState, useEffect } from "react";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import FreeResourceUpload from "../component/componentAdmin/FreeResourceUpload.jsx";
import FreeResourceManager from "../component/componentAdmin/FreeResourceManager.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import AuthAdminStore from "../store/AuthAdminStore.js";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/resources`;

const FreeResourceUploadPage = () => {
  const { token } = AuthAdminStore();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchResources();
  }, [token]);

  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="FREE RESOURCES" title="Manage Free Resource" />

      {/* Pass the refresh function to uploader */}
      <FreeResourceUpload token={token} onUploadSuccess={fetchResources} />

      {/* Pass resources data and loading to manager */}
      <FreeResourceManager
        token={token}
        resources={resources}
        loading={loading}
        refreshResources={fetchResources}
      />
    </LayoutAdmin>
  );
};

export default FreeResourceUploadPage;
