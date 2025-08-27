import React from "react";
import QuestionPreview from "../QuestionPreview.jsx";

const SubjectDescription = ({ description }) => {
  return (
    <div
      className={
        "bg-gray-50 shadow-inner rounded-2xl p-3 sticky top-4 h-fit"
      }
    >
      <QuestionPreview content={description} />
    </div>
  );
};

export default SubjectDescription;
