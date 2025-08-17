const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
	{
		questionIndex: { type: Number, required: true },
		subjectIndex: { type: Number, required: true },
		answer: { type: mongoose.Schema.Types.Mixed }, // Can be string, array, or file path
		isCorrect: { type: Boolean, default: null }, // null for pending manual review
		marksObtained: { type: Number, default: 0 },
		timeSpent: { type: Number, default: 0 }, // in seconds
	},
	{ _id: false }
);

const SubjectAttemptSchema = new mongoose.Schema(
	{
		subjectIndex: { type: Number, required: true },
		startTime: { type: Date, required: true },
		endTime: { type: Date },
		timeLimitMin: { type: Number, required: true },
		timeRemaining: { type: Number }, // in seconds
		isCompleted: { type: Boolean, default: false },
		answers: [AnswerSchema],
	},
	{ _id: false }
);

const ExamAttemptSchema = new mongoose.Schema(
	{
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

		// Time tracking
		startTime: { type: Date, required: true },
		endTime: { type: Date },
		totalDuration: { type: Number }, // in seconds

		// Status tracking
		status: {
			type: String,
			enum: ["in_progress", "completed", "timeout", "submitted"],
			default: "in_progress",
		},

		// Subject-wise attempts
		subjectAttempts: [SubjectAttemptSchema],

		// Auto-submission settings
		autoSubmitOnTimeout: { type: Boolean, default: true },

		// Results
		totalMarks: { type: Number, default: 0 },
		obtainedMarks: { type: Number, default: 0 },
		percentage: { type: Number, default: 0 },

		// Metadata
		ipAddress: { type: String },
		userAgent: { type: String },
		deviceInfo: { type: String },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);



// Pre-save middleware to calculate results
ExamAttemptSchema.pre("save", function (next) {
	if (
		this.status === "completed" ||
		this.status === "submitted" ||
		this.status === "timeout"
	) {
		this.calculateResults();
	}
	next();
});

// Method to calculate results
ExamAttemptSchema.methods.calculateResults = function () {
	let totalMarks = 0;
	let obtainedMarks = 0;

	this.subjectAttempts.forEach((subjectAttempt) => {
		subjectAttempt.answers.forEach((answer) => {
			if (answer.isCorrect !== null) {
				// Only count reviewed answers
				totalMarks += answer.marksObtained || 0;
			}
		});
	});

	this.obtainedMarks = obtainedMarks;
	this.percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
};

// Method to check if exam is timed out
ExamAttemptSchema.methods.isTimedOut = function () {
	const now = new Date();
	return this.subjectAttempts.some((subject) => {
		if (!subject.isCompleted) {
			const elapsed = (now - subject.startTime) / 1000 / 60; // in minutes
			return elapsed >= subject.timeLimitMin;
		}
		return false;
	});
};

// Method to handle timeout
ExamAttemptSchema.methods.handleTimeout = function () {
	const now = new Date();
	let hasTimeout = false;

	this.subjectAttempts.forEach((subject) => {
		if (!subject.isCompleted) {
			const elapsed = (now - subject.startTime) / 1000 / 60; // in minutes
			if (elapsed >= subject.timeLimitMin) {
				subject.endTime = now;
				subject.isCompleted = true;
				subject.timeRemaining = 0;
				hasTimeout = true;
			}
		}
	});

	if (hasTimeout) {
		this.status = "timeout";
		this.endTime = now;
		this.totalDuration = (now - this.startTime) / 1000; // in seconds
	}

	return hasTimeout;
};

// Method to get current subject attempt
ExamAttemptSchema.methods.getCurrentSubjectAttempt = function () {
	return this.subjectAttempts.find((subject) => !subject.isCompleted);
};

// Method to get time remaining for current subject
ExamAttemptSchema.methods.getTimeRemainingForCurrentSubject = function () {
	const currentSubject = this.getCurrentSubjectAttempt();
	if (!currentSubject) return 0;

	const now = new Date();
	const elapsed = (now - currentSubject.startTime) / 1000 / 60; // in minutes
	const remaining = Math.max(0, currentSubject.timeLimitMin - elapsed);

	return Math.floor(remaining * 60); // return in seconds
};

module.exports = mongoose.model("ExamAttempt", ExamAttemptSchema);