const Result = require("../models/Result");

class ResultService {
    async getResultsByExamId(examId) {
        try {
            const results = await Result.find({ examId })
              .select("-questionResults")
              .populate("userId", "name email fullName")
              .populate("examId", "title description")
              .sort({ createdAt: 1 }); // Ascending so we can number attempts correctly

            // Add attemptNumber per user (1 = first attempt, 2 = retake, etc.)
            const userAttemptCount = {};
            const annotated = results.map((r) => {
                const uid = String(r.userId?._id || r.userId);
                userAttemptCount[uid] = (userAttemptCount[uid] || 0) + 1;
                return { ...r.toObject(), attemptNumber: userAttemptCount[uid] };
            });

            // Return newest first for display
            return annotated.reverse();
        } catch (error) {
            throw new Error(`Error fetching results by exam ID: ${error.message}`);
        }
    }
}

module.exports = new ResultService();