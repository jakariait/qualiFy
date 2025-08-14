const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answer: mongoose.Schema.Types.Mixed, // flexible: {selectedOptions:[], shortAnswer: '...', imagePath: '...'}
  markedForReview: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Answer', AnswerSchema);
