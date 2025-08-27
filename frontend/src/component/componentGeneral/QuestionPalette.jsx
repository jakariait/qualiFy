import React from "react";

const QuestionPalette = ({ questions, answers, subjectName }) => {
  const totalQuestions = questions.length;
  const answeredQuestions = (Array.isArray(answers) ? answers : []).filter(
    (answer) => answer !== undefined && answer !== null && answer !== "",
  ).length;
  const remainingQuestions = totalQuestions - answeredQuestions;

  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-3">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl primaryTextColor font-bold mb-2">
          Subject: {subjectName}
        </h2>
        <p>
          Total Questions: <span className="font-bold">{totalQuestions}</span>
        </p>
        <p>
          Answered:{" "}
          <span className="font-bold text-green-600">{answeredQuestions}</span>
        </p>
        <p>
          Remaining:{" "}
          <span className="font-bold text-red-600">{remainingQuestions}</span>
        </p>
      </div>

    </div>
  );
};

export default QuestionPalette;
