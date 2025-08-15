# Exam System Implementation

This document describes the comprehensive exam system implementation for tracking user attempts, time synchronization, and automatic submission with result management.

## Features

### Core Features

- **One attempt per user per exam** - Prevents multiple attempts
- **Subject-based time limits** - Each subject has its own time limit
- **Real-time time synchronization** - Server-side time tracking
- **Automatic submission on timeout** - Exams auto-submit when time expires
- **Auto-grading for MCQs** - Multiple choice questions are automatically graded
- **Manual review for short answers and images** - Admin can review and grade these
- **Comprehensive result tracking** - Detailed analytics and statistics

### Time Management

- Server-side time tracking prevents client-side manipulation
- Automatic timeout detection and handling
- Background service monitors active exams
- Real-time time remaining updates

### Question Types Supported

1. **MCQ (Multiple Choice)** - Auto-graded
2. **Short Answer** - Manual review required
3. **Image Upload** - Manual review required

## Database Models

### ExamAttemptModel

Tracks individual user exam attempts with:

- User and exam association
- Subject-wise attempt tracking
- Time management
- Answer storage
- Status tracking

### Result Model

Stores detailed results with:

- Question-wise scoring
- Auto-graded MCQ results
- Manual review tracking
- Comprehensive statistics

## API Endpoints

### User Endpoints (Require User Authentication)

#### Start Exam Attempt

```
POST /api/exams/:examId/start
```

Starts a new exam attempt for the user.

**Response:**

```json
{
  "success": true,
  "message": "Exam attempt started successfully",
  "data": {
    "attemptId": "attempt_id",
    "exam": {
      "title": "Exam Title",
      "description": "Exam Description",
      "subjects": [...]
    },
    "currentSubject": 0,
    "timeRemaining": 3600
  }
}
```

#### Get Attempt Status

```
GET /api/exam-attempts/:attemptId/status
```

Returns current attempt status and time remaining.

#### Submit Answer

```
POST /api/exam-attempts/:attemptId/answers
```

Submit an answer for a specific question.

**Body:**

```json
{
	"subjectIndex": 0,
	"questionIndex": 1,
	"answer": ["option1", "option2"],
	"timeSpent": 120
}
```

#### Complete Subject

```
POST /api/exam-attempts/:attemptId/complete-subject
```

Mark a subject as completed.

**Body:**

```json
{
	"subjectIndex": 0
}
```

#### Submit Exam

```
POST /api/exam-attempts/:attemptId/submit
```

Manually submit the exam.

#### Get Exam Results

```
GET /api/exam-attempts/:attemptId/results
```

Get detailed results after exam completion.

#### Get Current Questions

```
GET /api/exam-attempts/:attemptId/questions
```

Get questions for the current subject.

#### Get Attempt Progress

```
GET /api/exam-attempts/:attemptId/progress
```

Get detailed progress information.

#### Sync Time

```
GET /api/exam-attempts/:attemptId/sync-time
```

Synchronize time with server.

#### Get User Attempts

```
GET /api/user/exam-attempts
```

Get all attempts for the current user.

### Admin Endpoints (Require Admin Authentication)

#### Get All Results

```
GET /api/results?page=1&limit=10&status=pending&examId=exam_id
```

Get paginated results with filtering options.

#### Get Specific Result

```
GET /api/results/:resultId
```

Get detailed result for review.

#### Review Question

```
POST /api/results/:resultId/review-question
```

Review and grade a specific question.

**Body:**

```json
{
	"questionIndex": 1,
	"subjectIndex": 0,
	"isCorrect": true,
	"marksObtained": 5,
	"adminFeedback": "Good answer!"
}
```

#### Review Multiple Questions

```
POST /api/results/:resultId/review-multiple
```

Review multiple questions at once.

**Body:**

```json
{
	"reviews": [
		{
			"questionIndex": 1,
			"subjectIndex": 0,
			"isCorrect": true,
			"marksObtained": 5
		}
	]
}
```

#### Finalize Result

```
POST /api/results/:resultId/finalize
```

Mark result as finalized (all questions reviewed).

#### Get Pending Questions

```
GET /api/results/:resultId/pending-questions
```

Get questions that need manual review.

#### Get Statistics

```
GET /api/results/statistics?examId=exam_id
```

Get comprehensive result statistics.

#### Export Results

```
GET /api/results/export?examId=exam_id
```

Export results to CSV format.

## Background Services

### ExamTimeoutService

- Monitors active exam attempts every 30 seconds
- Automatically handles timeouts
- Provides statistics and cleanup functions
- Runs as a background service

## Usage Examples

### Starting an Exam

```javascript
// Start exam attempt
const response = await fetch("/api/exams/exam_id/start", {
	method: "POST",
	headers: {
		Authorization: `Bearer ${userToken}`,
		"Content-Type": "application/json",
	},
});

const { data } = await response.json();
const { attemptId, timeRemaining } = data;
```

### Submitting Answers

```javascript
// Submit MCQ answer
await fetch(`/api/exam-attempts/${attemptId}/answers`, {
	method: "POST",
	headers: {
		Authorization: `Bearer ${userToken}`,
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		subjectIndex: 0,
		questionIndex: 1,
		answer: [0, 2], // Selected option indices
		timeSpent: 45,
	}),
});

// Submit short answer
await fetch(`/api/exam-attempts/${attemptId}/answers`, {
	method: "POST",
	headers: {
		Authorization: `Bearer ${userToken}`,
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		subjectIndex: 0,
		questionIndex: 5,
		answer: "The answer is 42",
		timeSpent: 120,
	}),
});
```

### Time Synchronization

```javascript
// Sync time every 30 seconds
setInterval(async () => {
	const response = await fetch(`/api/exam-attempts/${attemptId}/sync-time`);
	const { data } = await response.json();

	if (data.timeRemaining <= 0) {
		// Handle timeout
		handleExamTimeout();
	} else {
		// Update UI with remaining time
		updateTimer(data.timeRemaining);
	}
}, 30000);
```

### Admin Review Process

```javascript
// Get pending questions
const response = await fetch(`/api/results/${resultId}/pending-questions`);
const { data } = await response.json();

// Review each question
for (const question of data.pendingQuestions) {
	await fetch(`/api/results/${resultId}/review-question`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${adminToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			questionIndex: question.questionIndex,
			subjectIndex: question.subjectIndex,
			isCorrect: true,
			marksObtained: question.maxMarks,
			adminFeedback: "Excellent answer!",
		}),
	});
}

// Finalize result
await fetch(`/api/results/${resultId}/finalize`, {
	method: "POST",
	headers: {
		Authorization: `Bearer ${adminToken}`,
	},
});
```

## Security Features

1. **One attempt per user per exam** - Database-level unique constraint
2. **Server-side time tracking** - Prevents client-side manipulation
3. **Authentication required** - All endpoints require proper authentication
4. **Admin-only result review** - Only admins can review and grade
5. **Answer validation** - Server validates all submitted answers

## Error Handling

The system includes comprehensive error handling for:

- Duplicate attempts
- Timeout violations
- Invalid question submissions
- Authentication failures
- Database errors

## Performance Considerations

1. **Background processing** - Timeout checks run in background
2. **Efficient queries** - Optimized database queries with proper indexing
3. **Pagination** - Large result sets are paginated
4. **Caching** - Frequently accessed data can be cached

## Monitoring and Maintenance

### Background Service

The ExamTimeoutService runs continuously and:

- Monitors active exams every 30 seconds
- Logs timeout events
- Provides statistics
- Handles cleanup of old attempts

### Statistics

The system provides comprehensive statistics including:

- Overall exam performance
- MCQ accuracy rates
- Manual review progress
- Timeout statistics

## Future Enhancements

1. **Real-time notifications** - WebSocket support for live updates
2. **Advanced analytics** - Detailed performance analytics
3. **Bulk operations** - Batch review and grading
4. **Export formats** - Additional export formats (PDF, Excel)
5. **Proctoring features** - Screen recording, tab switching detection
