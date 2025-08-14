import React from "react";
import ExamForm from "../component/componentAdmin/ExamForm.jsx";
import { useNavigate } from "react-router-dom";
import LayoutAdmin from "../component/componentAdmin/LayoutAdmin.jsx";
import Breadcrumb from "../component/componentAdmin/Breadcrumb.jsx";

export default function CreateExamPage() {
  const navigate = useNavigate();

  return (
    <LayoutAdmin>
      <Breadcrumb pageDetails="EXAM" title="Create Exam" />
      <div className={"shadow rounded"}>
        <div className="shadow rounded-lg">
          <div className="p-4">
            <h1 className="border-l-4 primaryBorderColor primaryTextColor pl-2 text-lg font-semibold">
              Create Exam
            </h1>
          </div>

          <div className={"pt-4"}>
            <ExamForm onSuccess={() => navigate("/admin/exams")} />
          </div>

        </div>
      </div>

    </LayoutAdmin>
  );
}
