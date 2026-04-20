import React from "react";
import ExamForm from "../component/componentAdmin/ExamForm.jsx";
import { useParams, useNavigate } from "react-router-dom";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";

export default function EditExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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
            initialData={{ _id: id }}
            onSuccess={() => navigate("/admin/exams")}
          />
        </div>
      </div>
    </LayoutAdmin>
  );
}
