import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/resources`;
const UPLOADS_BASE = `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads`;

const ResourceViewer = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/${id}`);
        setResource(res.data.data); // assuming your API returns { data: resource }
        setError("");
      } catch (err) {
        setError("Failed to load resource.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!resource)
    return <p className="text-center mt-10">Resource not found.</p>;

  return (
    <div className="xl:container md:mx-auto p-4 md:p-6">
      <div className={"flex items-center mb-3 gap-4 w-full"}>
        <h1 className="text-2xl  font-bold ">
          You are viewing:{" "}
          <span className={"primaryTextColor"}>{resource.name}</span>{" "}
        </h1>
      </div>

      {/* Inline PDF viewer */}
      <div className="border rounded shadow">
        <iframe
          src={`${UPLOADS_BASE}/${resource.resourcePdf}`}
          title="Resource PDF"
          width="100%"
          height="1000px"
          className="rounded"
        />
      </div>
    </div>
  );
};

export default ResourceViewer;
