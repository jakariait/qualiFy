import React from "react";
import QuestionPreview from "../QuestionPreview.jsx";

const SubjectDescription = ({ description }) => {
  if (!description) return null; // Return null if no description

  return (
    <div
      className={
        "bg-gray-100 shadow-inner rounded-2xl p-5 sticky top-17 h-[200px] overflow-y-auto custom-scrollbar"
      }
    >
      <QuestionPreview content={description} />
    </div>
  );
};

export default SubjectDescription;
