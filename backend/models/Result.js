const mongoose = require("mongoose");

const SubjectBreakdownSchema = new mongoose.Schema(
	{
		subjectIndex: { type: Number, required: true },
		subjectTitle: { type: String, required: true },
		totalMarks: { type: Number, default: 0 },
		obtainedMarks: { type: Number, default: 0 },
		correctCount: { type: Number, default: 0 },
		wrongCount: { type: Number, default: 0 },
		unansweredCount: { type: Number, default: 0 },
		timeSpent: { type: Number, default: 0 }, // in seconds
		timeLimit: { type: Number, default: 0 }, // in minutes
		percentage: { type: Number, default: 0 },
	},
	{ _id: false }
);

const QuestionResultSchema = new mongoose.Schema(
	{
		questionIndex: { type: Number, required: true },
		subjectIndex: { type: Number, required: true },
		questionType: {
			type: String,
			enum: ["mcq-single", "short", "image"],
			required: true,
		},
		questionText: { type: String, required: true },
		userAnswer: { type: mongoose.Schema.Types.Mixed },
		correctAnswer: { type: mongoose.Schema.Types.Mixed },
		isCorrect: { type: Boolean, default: null }, // null for pending manual review
		marksObtained: { type: Number, default: 0 },
		maxMarks: { type: Number, default: 1 },
		timeSpent: { type: Number, default: 0 }, // in seconds
		adminFeedback: { type: String, default: "" },
		reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
		reviewedAt: { type: Date },
	},
	{ _id: false }
);

const ResultSchema = new mongoose.Schema(
	{
		attemptId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ExamAttempt",
			unique: true,
		},
		examId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exam",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Overall results
		totalMarks: { type: Number, default: 0 },
		obtainedMarks: { type: Number, default: 0 },
		percentage: { type: Number, default: 0 },

		// Detailed breakdowns
		perSubject: [SubjectBreakdownSchema],
		questionResults: [QuestionResultSchema],

		// Status and review
		status: {
			type: String,
			enum: ["pending_manual_review", "partially_reviewed", "finalized"],
			default: "pending_manual_review",
		},

		// Auto-graded MCQ results
		mcqCorrectCount: { type: Number, default: 0 },
		mcqWrongCount: { type: Number, default: 0 },
		mcqTotalCount: { type: Number, default: 0 },

		// Manual review counts
		pendingReviewCount: { type: Number, default: 0 },
		reviewedCount: { type: Number, default: 0 },

		// Time tracking
		totalTimeSpent: { type: Number, default: 0 }, // in seconds
		totalTimeLimit: { type: Number, default: 0 }, // in minutes

		// Submission details
		submittedAt: { type: Date },
		finalizedAt: { type: Date },
		finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
	},
	{ timestamps: true, versionKey: false }
);

// Pre-save middleware to calculate statistics
ResultSchema.pre("save", function (next) {
	this.calculateStatistics();
	next();
});

// Method to calculate statistics
ResultSchema.methods.calculateStatistics = function () {
	// Calculate MCQ statistics
	this.mcqCorrectCount = 0;
	this.mcqWrongCount = 0;
	this.mcqTotalCount = 0;
	this.pendingReviewCount = 0;
	this.reviewedCount = 0;

	this.questionResults.forEach((question) => {
		if (question.questionType === "mcq-single") {
			this.mcqTotalCount++;
			if (question.isCorrect === true) {
				this.mcqCorrectCount++;
			} else if (question.isCorrect === false) {
				this.mcqWrongCount++;
			}
		}

		if (question.isCorrect === null) {
			this.pendingReviewCount++;
		} else {
			this.reviewedCount++;
		}
	});

	// Update status based on review progress
	if (this.pendingReviewCount === 0 && this.reviewedCount > 0) {
		this.status = "finalized";
	} else if (this.reviewedCount > 0) {
		this.status = "partially_reviewed";
	}

	// Calculate total marks and percentage
	this.totalMarks = this.questionResults.reduce(
		(sum, q) => sum + q.maxMarks,
		0
	);
	this.obtainedMarks = this.questionResults.reduce(
		(sum, q) => sum + q.marksObtained,
		0
	);
	this.percentage =
		this.totalMarks > 0 ? (this.obtainedMarks / this.totalMarks) * 100 : 0;
};

// Method to auto-grade MCQ questions
ResultSchema.methods.autoGradeMCQs = function () {
	this.questionResults.forEach((question) => {
		if (question.questionType === "mcq-single" && question.isCorrect === null) {
			// Compare user answer with correct answer
			if (
				Array.isArray(question.userAnswer) &&
				Array.isArray(question.correctAnswer)
			) {
				const userAnswers = question.userAnswer.sort();
				const correctAnswers = question.correctAnswer.sort();

				question.isCorrect =
					JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
				question.marksObtained = question.isCorrect ? question.maxMarks : 0;
			}
		}
	});

	this.save();
};

// Method to get subject breakdown
ResultSchema.methods.getSubjectBreakdown = function () {
	const breakdown = {};

	this.questionResults.forEach((question) => {
		if (!breakdown[question.subjectIndex]) {
			breakdown[question.subjectIndex] = {
				totalMarks: 0,
				obtainedMarks: 0,
				correctCount: 0,
				wrongCount: 0,
				unansweredCount: 0,
				timeSpent: 0,
			};
		}

		breakdown[question.subjectIndex].totalMarks += question.maxMarks;
		breakdown[question.subjectIndex].obtainedMarks += question.marksObtained;
		breakdown[question.subjectIndex].timeSpent += question.timeSpent;

		if (question.isCorrect === true) {
			breakdown[question.subjectIndex].correctCount++;
		} else if (question.isCorrect === false) {
			breakdown[question.subjectIndex].wrongCount++;
		} else {
			breakdown[question.subjectIndex].unansweredCount++;
		}
	});

	return breakdown;
};

module.exports = mongoose.model("Result", ResultSchema);
