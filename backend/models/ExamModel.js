const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

const ExamSchema = new mongoose.Schema(
  {
    examId: { type: String, unique: true },
    slug: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String },

    status: {
      type: String,
      enum: ["draft", "published", "inactive"],
      default: "draft",
    },

    isFree: { type: Boolean, default: false },

    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    subjects: [
      {
        title: { type: String, required: true },
        description: { type: String },
        timeLimitMin: { type: Number, default: null },
        questions: [
          {
            type: {
              type: String,
              enum: ["mcq-single", "short", "image"],
              required: true,
            },
            text: { type: String, required: true },
            options: [{ type: String }], // for MCQs
            correctAnswers: [{ type: Number }], // indices for MCQs
            solution: { type: String, default: "" },
            marks: { type: Number, default: 1 },
          },
        ],
      },
    ],

    durationMin: { type: Number, default: 0 }, // auto-calculated from subjects
    totalMarks: { type: Number, default: 0 }, // auto-calculated from questions
  },
  { timestamps: true, versionKey: false },
);

ExamSchema.index({ isFree: 1, status: 1 });

// Auto-calculate total time and marks before save
ExamSchema.pre("save", function (next) {
  if (this.isNew) {
    this.examId = uuidv4();
  }

  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  let totalTime = 0;
  let totalMarks = 0;

  if (this.subjects && this.subjects.length > 0) {
    this.subjects.forEach((subject) => {
      totalTime += subject.timeLimitMin || 0;
      if (subject.questions && subject.questions.length > 0) {
        totalMarks += subject.questions.reduce(
          (sum, q) => sum + (q.marks || 0),
          0,
        );
      }
    });
  }

  this.durationMin = totalTime;
  this.totalMarks = totalMarks;
  next();
});

module.exports = mongoose.model("Exam", ExamSchema);
