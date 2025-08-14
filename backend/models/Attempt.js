const mongoose = require('mongoose');

const SubjectStateSchema = new mongoose.Schema({
  subjectKey: String,
  startedAt: Date,
  endsAt: Date,
  timeUsedSec: { type: Number, default: 0 },
  isComplete: { type: Boolean, default: false }
}, { _id: false });

const AnswerEmbeddedSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  // union fields
  selectedOptions: [{ type: Number }], // for MCQ
  shortAnswer: { type: String },
  longAnswer: { type: String },
  imagePath: { type: String }, // uploaded image path
  markedForReview: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const AttemptSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['in_progress','submitted','auto_submitted','expired'], default: 'in_progress' },
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date }, // computed from overall or subject timers
  subjectStates: [SubjectStateSchema],
  answers: [AnswerEmbeddedSchema],
  violationCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
