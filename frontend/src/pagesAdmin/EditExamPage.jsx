import React, { useEffect, useState } from "react";
import axios from "axios";
import ExamForm from "../component/componentAdmin/ExamForm.jsx";
import { useParams, useNavigate } from "react-router-dom";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";
import useAuthAdminStore from "../store/AuthAdminStore.js";

export default function EditExamPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API_URL}/exams/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Handle nested data structure from API
        const examData = res.data?.exam || res.data?.data || res.data;
        console.log("API Response:", res.data);
        console.log("Extracted exam data:", examData);
        setExam(examData);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch exam data");
      }
    };
    fetchExam();
  }, [id]);

  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="EXAM" title="Update Exam" />
      <div className={"shadow rounded"}>
        <div className="p-4">
          <h1 className="border-l-4 primaryBorderColor primaryTextColor pl-2 text-lg font-semibold">
            Update Exam
          </h1>
        </div>

        <div className={"pt-4"}>
          <ExamForm
            initialData={exam}
            onSuccess={() => navigate("/admin/exams")}
          />
        </div>
      </div>
    </LayoutAdmin>
  );
}
