import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = `${import.meta.env.VITE_API_URL}/resources`;
const UPLOADS_BASE = `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads`;

const PAGE_SIZE = 9;

const FreeResourcesUserView = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const universities = ["All", "NSU", "BRAC", "IUB", "AIUB", "EWU"];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterByUniversity(selectedUniversity);
    setCurrentPage(1); // Reset to first page on filter change
  }, [resources, selectedUniversity]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setResources(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch resources", err);
    } finally {
      setLoading(false);
    }
  };

  const filterByUniversity = (university) => {
    if (university === "All") {
      setFilteredResources(resources);
    } else {
      setFilteredResources(
        resources.filter((r) => r.universityName === university),
      );
    }
  };

  const handleUniversityChange = (uni) => {
    setSelectedUniversity(uni);
  };

  const handlePdfClick = (resourceId) => {
    navigate(`/resource-viewer/${resourceId}`);
  };

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / PAGE_SIZE);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="xl:container md:mx-auto p-4 md:p-6">
      <div className="text-center mb-10 px-4">
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            Explore Our{" "}
            <span className="relative inline-block primaryTextColor">
              Free Resources
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M2 8C2 8 50 2 100 4C150 6 198 8 198 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="primaryTextColor"
                />
              </svg>
            </span>
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Access a curated collection of free resources to guide you through
            your university admission journey. From application tips to exam
            preparation materials, our resources are designed to help you
            succeed and make informed decisions with confidence.
          </p>
        </div>
      </div>

      {/* University Tabs */}
      <div className="flex justify-center overflow-x-auto no-scrollbar gap-2 mb-6 px-2">
        {universities.map((uni) => (
          <button
            key={uni}
            onClick={() => handleUniversityChange(uni)}
            className={`flex-shrink-0 px-4 py-2 cursor-pointer rounded whitespace-nowrap ${
              selectedUniversity === uni
                ? "primaryBgColor accentTextColor"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {uni}
          </button>
        ))}
      </div>



      {loading ? (
        <p className="text-center">Loading...</p>
      ) : paginatedResources.length === 0 ? (
        <p className="text-center md:mt-40">No resources found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paginatedResources.map((res) => (
            <div key={res._id} className=" rounded-b-md  shadow flex flex-col">
              <img
                src={`${UPLOADS_BASE}/${res.resourceThumbnailImage}`}
                alt={res.name}
                className=" w-full object-cover"
              />
              <div className={"p-3 space-y-1"}>
                <h2 className="font-semibold text-lg primaryTextColor">
                  {res.name}
                </h2>
                <p className="text-sm  text-gray-600">
                  University: {res.universityName}
                </p>
              </div>

              <div className="flex justify-center p-3">
                <button
                  onClick={() => handlePdfClick(res._id)}
                  className="mt-auto cursor-pointer px-3 py-2 rounded primaryBgColor accentTextColor w-44 "
                >
                  View PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 primaryBgColor accentTextColor  rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages).keys()].map((num) => {
            const pageNum = num + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1  rounded ${
                  pageNum === currentPage ? "primaryBgColor accentTextColor" : ""
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded primaryBgColor accentTextColor disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FreeResourcesUserView;
