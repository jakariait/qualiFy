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
		startTime: { type: Date },
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
ExamAttemptSchema.pre("save", async function (next) {
	if (
		this.status === "completed" ||
		this.status === "submitted" ||
		this.status === "timeout"
	) {
		await this.calculateResults();
	}
	next();
});

// Method to calculate results
ExamAttemptSchema.methods.calculateResults = async function () {
	let calculatedObtainedMarks = 0;

	this.subjectAttempts.forEach((subjectAttempt) => {
		subjectAttempt.answers.forEach((answer) => {
			if (answer.isCorrect !== null) {
				// Only count reviewed answers
				calculatedObtainedMarks += answer.marksObtained || 0;
			}
		});
	});

	this.obtainedMarks = calculatedObtainedMarks;

	// Fetch the Exam document to get total possible marks
	const Exam = this.model('Exam'); // Get the Exam model
	const exam = await Exam.findById(this.examId);

	if (exam && exam.totalMarks !== undefined) {
		this.totalMarks = exam.totalMarks;
	} else {
		console.warn(`Exam ${this.examId} or its totalMarks not found for ExamAttempt ${this._id}. Setting totalMarks to 0.`);
		this.totalMarks = 0;
	}

	this.percentage = this.totalMarks > 0 ? (this.obtainedMarks / this.totalMarks) * 100 : 0;
};

// Method to check if exam is timed out
ExamAttemptSchema.methods.isTimedOut = function () {
	const currentSubject = this.getCurrentSubjectAttempt();
	if (!currentSubject) {
		return false;
	}
	const now = new Date();
	const elapsed = (now - currentSubject.startTime) / 1000 / 60; // in minutes
	return elapsed >= currentSubject.timeLimitMin;
};

// Method to handle timeout
ExamAttemptSchema.methods.handleTimeout = function () {
	const currentSubject = this.getCurrentSubjectAttempt();
	if (!currentSubject) {
		return false;
	}

	const now = new Date();
	const elapsed = (now - currentSubject.startTime) / 1000 / 60; // in minutes

	if (elapsed >= currentSubject.timeLimitMin) {
		currentSubject.endTime = now;
		currentSubject.isCompleted = true;
		currentSubject.timeRemaining = 0;

		const allSubjectsCompleted = this.subjectAttempts.every(s => s.isCompleted);

		if (allSubjectsCompleted) {
			this.status = "completed";
			this.endTime = now;
			this.totalDuration = (now - this.startTime) / 1000; // in seconds
		}
		return true;
	}

	return false;
};

// Method to get current subject attempt
ExamAttemptSchema.methods.getCurrentSubjectAttempt = function () {
	// Find the first subject that is not marked as completed
	const firstUncompleted = this.subjectAttempts.find(
		(subject) => !subject.isCompleted
	);

	// If a subject is found, it's the current one
	if (firstUncompleted) {
		return firstUncompleted;
	}

	// If all subjects are completed, there is no current subject
	return null;
};

// Method to get time remaining for current subject
ExamAttemptSchema.methods.getTimeRemainingForCurrentSubject = function () {
	const currentSubject = this.getCurrentSubjectAttempt();
	if (!currentSubject || currentSubject.isCompleted) {
		return 0;
	}

	// If timeRemaining is already stored, use it
	if (currentSubject.timeRemaining) {
		const now = new Date();
		const lastUpdated = currentSubject.endTime || currentSubject.startTime;
		const elapsedSinceUpdate = (now - lastUpdated) / 1000; // in seconds
		const remaining = Math.max(0, currentSubject.timeRemaining - elapsedSinceUpdate);
		return Math.floor(remaining);
	}

	// If timeRemaining is not stored, calculate it from the time limit
	const now = new Date();
	const elapsed = (now - currentSubject.startTime) / 1000; // in seconds
	const remaining = Math.max(0, currentSubject.timeLimitMin * 60 - elapsed);

	return Math.floor(remaining);
};

module.exports = mongoose.model("ExamAttempt", ExamAttemptSchema);