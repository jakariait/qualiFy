import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import useAuthUserStore from "../../store/AuthUserStore.js";
import dayjs from "dayjs";

const CourseExamNotices = () => {
  const { productId } = useParams(); // get productId from URL
  const { token } = useAuthUserStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_URL}/course-exam-notices`;

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`${API_URL}/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotices(res.data);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchNotices();
  }, [productId]);

  if (loading) return <p>Loading notices...</p>;

  if (notices.length === 0) return <p>No notices found for this product.</p>;

  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-3">
      <h1 className="flex items-center justify-center primaryBorderColor primaryTextColor mb-6 pl-2 text-2xl font-semibold">
        Course/Exam Notices
      </h1>
      <div className={"space-y-2"}>
        {notices.map((notice) => (
          <div key={notice._id} className=" rounded p-3 shadow-inner bg-white">
            <div className="text-xs flex  justify-between mb-2 text-gray-500 mt-2">
              <p>
                Created: {dayjs(notice.createdAt).format("MMMM D, YYYY h:mm A")}
              </p>
              <p>
                Updated: {dayjs(notice.updatedAt).format("MMMM D, YYYY h:mm A")}
              </p>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(notice.description),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseExamNotices;
