import React from 'react';

const QuestionPalette = ({ questions, answers }) => {
    

    return (
        <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                    <button
                        key={index}
                        className={`p-2 border rounded text-center ${
                            answers[index] !== undefined && answers[index] !== ''
                                ? 'bg-green-500 text-white' // Answered
                                : 'bg-gray-200' // Unanswered
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionPalette;