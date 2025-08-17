const ExamAttempt = require("../models/ExamAttemptModel");

class ResultService {
    async getResultsByExamId(examId) {
        try {
            const results = await ExamAttempt.find({ examId })
                .populate("userId", "name email fullName") // Populate user details
                .populate("examId", "title description") // Populate exam details
                .sort({ createdAt: -1 }); // Sort by creation date, newest first
            return results;
        } catch (error) {
            throw new Error(`Error fetching results by exam ID: ${error.message}`);
        }
    }
}

module.exports = new ResultService();
