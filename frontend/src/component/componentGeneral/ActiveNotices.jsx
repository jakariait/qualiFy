import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthUserStore from "../../store/AuthUserStore.js";

const API_URL = `${import.meta.env.VITE_API_URL}/notices/active`;

const ActiveNotices = () => {
  const { token } = useAuthUserStore();

  const [notices, setNotices] = useState([]);

  // ✅ Fetch active notices
  const fetchActiveNotices = async () => {
    try {
      const { data } = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotices(data);
    } catch (error) {
      console.error("Error fetching active notices", error);
    }
  };

  useEffect(() => {
    fetchActiveNotices();
  }, []);

  // ✅ If no active notices, render null
  if (!notices.length) return null;

  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-3">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-3 pl-2 text-2xl font-semibold">
        Latest Notices & Offers
      </h1>
      <ul className="space-y-4">
        {notices.map((notice) => (
          <li
            key={notice._id}
            className="p-4 shadow rounded bg-gray-50"
            dangerouslySetInnerHTML={{ __html: notice.description }} // render HTML from editor
          />
        ))}
      </ul>
    </div>
  );
};

export default ActiveNotices;
