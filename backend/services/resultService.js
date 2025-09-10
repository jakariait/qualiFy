const Result = require("../models/Result");

class ResultService {
    async getResultsByExamId(examId) {
        try {
            const results = await Result.find({ examId })
              .select("-questionResults")
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