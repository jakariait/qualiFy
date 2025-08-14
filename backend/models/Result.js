const mongoose = require('mongoose');

const SubjectBreakdownSchema = new mongoose.Schema({
  subjectKey: String,
  totalMarks: Number,
  obtainedMarks: Number,
  correctCount: Number,
  wrongCount: Number,
  unansweredCount: Number
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', unique: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalMarks: Number,
  obtainedMarks: Number,
  percentage: Number,
  perSubject: [SubjectBreakdownSchema],
  status: { type: String, enum: ['pending_manual_review','finalized'], default: 'pending_manual_review' }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
