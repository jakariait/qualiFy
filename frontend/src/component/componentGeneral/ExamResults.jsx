
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAuthUserStore from '../../store/AuthUserStore.js';

const ExamResults = () => {
    const { attemptId } = useParams();
    const { token } = useAuthUserStore();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(`/api/exam-attempts/${attemptId}/results`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch results');
                }
                const data = await response.json();
                if (data.success) {
                    setResults(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch results');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchResults();
        }
    }, [attemptId, token]);

    if (loading) return <div>Loading results...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!results) return <div>No results found.</div>;

    const { attempt, result, exam } = results;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Exam Results</h1>
            <div className="mb-4">
                <h2 className="text-2xl font-semibold">{exam.title}</h2>
                <p>{exam.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-bold">Summary</h3>
                    <p><strong>Status:</strong> {attempt.status}</p>
                    <p><strong>Total Marks:</strong> {result.totalMarks}</p>
                    <p><strong>Obtained Marks:</strong> {result.obtainedMarks}</p>
                    <p><strong>Percentage:</strong> {result.percentage?.toFixed(2)}%</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-bold">MCQ Stats</h3>
                    <p><strong>Correct:</strong> {result.mcqResults.correct}</p>
                    <p><strong>Wrong:</strong> {result.mcqResults.wrong}</p>
                    <p><strong>Total:</strong> {result.mcqResults.total}</p>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-2">Detailed Results</h3>
                {result.questionResults.map((qResult, index) => (
                    <div key={index} className="border-b py-2">
                        <p className="font-semibold" dangerouslySetInnerHTML={{ __html: qResult.questionText }}></p>
                        <p><strong>Your Answer:</strong> {JSON.stringify(qResult.userAnswer)}</p>
                        <p><strong>Correct Answer:</strong> {(() => {
                            let displayCorrectAnswer = JSON.stringify(qResult.correctAnswer);
                            const subject = exam.subjects[qResult.subjectIndex];
                            const question = subject?.questions[qResult.questionIndex];

                            if (question && (qResult.questionType === "mcq-single" || qResult.questionType === "mcq-multiple")) {
                                if (Array.isArray(qResult.correctAnswer) && question.options) {
                                    displayCorrectAnswer = qResult.correctAnswer.map(idx => question.options[idx]).join(', ');
                                }
                            }
                            return displayCorrectAnswer;
                        })()}</p>
                        <p><strong>Status:</strong> {qResult.isCorrect === true ? <span className='text-green-500'>Correct</span> : qResult.isCorrect === false ? <span className='text-red-500'>Incorrect</span> : <span className='text-yellow-500'>Pending Review</span>}</p>
                        <p><strong>Marks Obtained:</strong> {qResult.marksObtained} / {qResult.maxMarks}</p>
                        {(() => {
                            const subject = exam.subjects[qResult.subjectIndex];
                            const question = subject?.questions[qResult.questionIndex];
                            if (question && question.solution) {
                                return <p><strong>Solution:</strong> <span dangerouslySetInnerHTML={{ __html: question.solution }}></span></p>;
                            }
                            return null;
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamResults;
