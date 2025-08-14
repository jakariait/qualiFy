const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  status: {
    type: String,
    enum: ['draft', 'published', 'inactive'],
    default: 'draft'
  },

  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  subjects: [
    {
      title: { type: String, required: true },
      timeLimitMin: { type: Number, default: null },
      questions: [
        {
          type: { type: String, enum: ['mcq-single','short','image'], required: true },
          text: { type: String, required: true },
          options: [{ type: String }], // for MCQs
          correctAnswers: [{ type: Number }], // indices for MCQs
          solution: { type: String, default: "" },
          marks: { type: Number, default: 1 },
        }
      ]
    }
  ],
  durationMin: { type: Number, default: 0 }, // auto-calculated from subjects
  totalMarks: { type: Number, default: 0 }   // auto-calculated from questions
}, { timestamps: true, versionKey: false });

// Auto-calculate total time and marks before save
ExamSchema.pre('save', function(next) {
  let totalTime = 0;
  let totalMarks = 0;

  if (this.subjects && this.subjects.length > 0) {
    this.subjects.forEach(subject => {
      totalTime += subject.timeLimitMin || 0;
      if (subject.questions && subject.questions.length > 0) {
        totalMarks += subject.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      }
    });
  }

  this.durationMin = totalTime;
  this.totalMarks = totalMarks;
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);
