import React from "react";
import QuestionPreview from "../QuestionPreview.jsx";

const SubjectDescription = ({ description }) => {
  if (!description) return null; // Return null if no description

  return (
    <div
      className="bg-orange-200 shadow-inner rounded-2xl p-5 sticky top-17 max-h-[40vh] overflow-y-auto custom-scrollbar"
    >
      <QuestionPreview content={description} />
    </div>
  );
};

export default SubjectDescription;
