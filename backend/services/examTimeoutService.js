const ExamAttempt = require("../models/ExamAttemptModel");
const examAttemptService = require("./examAttemptService");

class ExamTimeoutService {
	constructor() {
		this.timeoutCheckInterval = null;
		this.isRunning = false;
	}

	// Start the timeout monitoring service
	start() {
		if (this.isRunning) {
			console.log("Exam timeout service is already running");
			return;
		}

		this.isRunning = true;
		console.log("Starting exam timeout monitoring service...");

		// Check for timeouts every 30 seconds
		this.timeoutCheckInterval = setInterval(async () => {
			await this.checkForTimeouts();
		}, 30000); // 30 seconds
	}

	// Stop the timeout monitoring service
	stop() {
		if (this.timeoutCheckInterval) {
			clearInterval(this.timeoutCheckInterval);
			this.timeoutCheckInterval = null;
		}
		this.isRunning = false;
		console.log("Exam timeout monitoring service stopped");
	}

	// Check for exams that have timed out
	async checkForTimeouts() {
		try {
			// Find all in-progress exam attempts
			const inProgressAttempts = await ExamAttempt.find({
				status: "in_progress",
			}).populate("examId", "subjects");

			console.log(
				`Checking ${inProgressAttempts.length} in-progress exam attempts for timeouts`
			);

			for (const attempt of inProgressAttempts) {
				try {
					// Check if the current subject has timed out
					const currentSubject = attempt.getCurrentSubjectAttempt();
					if (currentSubject) {
						const now = new Date();
						const elapsed = (now - currentSubject.startTime) / 1000 / 60; // in minutes
						if (elapsed >= currentSubject.timeLimitMin) {
							console.log(`Timeout detected for attempt ${attempt._id}`);
							await this.handleTimeout(attempt);
						}
					}
				} catch (error) {
					console.error(
						`Error checking timeout for attempt ${attempt._id}:`,
						error
					);
				}
			}
		} catch (error) {
			console.error("Error in timeout check:", error);
		}
	}

	// Handle timeout for a specific attempt
	async handleTimeout(attempt) {
		try {
			console.log(`Auto-advancing subject due to timeout for attempt ${attempt._id}`);
			// Reuse the advanceSubject logic to ensure consistent state transitions.
			await examAttemptService.advanceSubject(attempt._id, attempt.userId);
		} catch (error) {
			console.error(
				`Error handling timeout for attempt ${attempt._id}:`,
				error
			);
		}
	}

	// Force timeout for a specific attempt (admin function)
	async forceTimeout(attemptId) {
		try {
			const attempt = await ExamAttempt.findById(attemptId);
			if (!attempt) {
				throw new Error("Attempt not found");
			}

			if (attempt.status !== "in_progress") {
				throw new Error("Attempt is not in progress");
			}

			await this.handleTimeout(attempt);

			return {
				success: true,
				message: "Timeout forced successfully",
			};
		} catch (error) {
			throw error;
		}
	}

	// Get timeout statistics
	async getTimeoutStats() {
		try {
			const stats = await ExamAttempt.aggregate([
				{
					$group: {
						_id: "$status",
						count: { $sum: 1 },
						avgDuration: { $avg: "$totalDuration" },
					},
				},
			]);

			const timeoutStats = await ExamAttempt.aggregate([
				{ $match: { status: "timeout" } },
				{
					$group: {
						_id: null,
						totalTimeouts: { $sum: 1 },
						avgTimeoutDuration: { $avg: "$totalDuration" },
					},
				},
			]);

			return {
				statusBreakdown: stats,
				timeoutStats: timeoutStats[0] || {
					totalTimeouts: 0,
					avgTimeoutDuration: 0,
				},
			};
		} catch (error) {
			throw error;
		}
	}

	// Clean up old completed attempts (optional maintenance function)
	async cleanupOldAttempts(daysOld = 30) {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysOld);

			const result = await ExamAttempt.deleteMany({
				status: { $in: ["completed", "timeout", "submitted"] },
				createdAt: { $lt: cutoffDate },
			});

			console.log(`Cleaned up ${result.deletedCount} old exam attempts`);

			return {
				success: true,
				deletedCount: result.deletedCount,
			};
		} catch (error) {
			console.error("Error cleaning up old attempts:", error);
			throw error;
		}
	}
}

// Create singleton instance
const examTimeoutService = new ExamTimeoutService();

// Start the service when this module is loaded
if (process.env.NODE_ENV !== "test") {
	examTimeoutService.start();
}

// Graceful shutdown
process.on("SIGINT", () => {
	console.log("Shutting down exam timeout service...");
	examTimeoutService.stop();
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("Shutting down exam timeout service...");
	examTimeoutService.stop();
	process.exit(0);
});

module.exports = examTimeoutService;
