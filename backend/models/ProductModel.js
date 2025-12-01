const mongoose = require("mongoose");
const CounterModel = require("./CounterModel");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, unique: true, index: true },
    isPreBooked: { type: Boolean, default: false },
    name: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, unique: true },
    type: {
      type: String,
      enum: ["book", "course", "exam"],
      required: true,
      index: true,
    },

    longDesc: { type: String, trim: true },

    // Shared
    thumbnailImage: { type: String, trim: true, required: true },
    videoUrl: [{ type: String, trim: true }],
    faqs: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
      },
    ],

    isActive: { type: Boolean, default: true, index: true },

    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: [{ type: String, trim: true }],

    // Pricing
    finalPrice: {
      type: Number,
      min: 0,
      required: true,
      validate: {
        validator: (value) => value >= 0,
        message: "Price cannot be negative",
      },
    },
    finalDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalStock: {
      type: Number,
      min: 0,
    },

    // Book-specific
    author: { type: String, trim: true },
    publisher: { type: String, trim: true },
    previewPdf: { type: String, trim: true },

    // Course-specific
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeacherProfile",
      },
    ],
    lessons: { type: String, trim: true },
    enrolledStudents: { type: Number, trim: true },
    duration: { type: String, trim: true },
    quizzes: { type: Number, trim: true },
    classStartDate: { type: String, trim: true },
    courseIntroVideo: { type: String, trim: true },
    modules: [
      {
        subject: { type: String }, // e.g., "English", "G.Math"
        lessons: [
          {
            title: { type: String },
            duration: { type: String, trim: true },
            courseThumbnail: { type: String, trim: true },
            link: { type: String, trim: true },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Auto-increment ID and slug
productSchema.pre("validate", async function (next) {
  if (!this.productId) {
    try {
      const counter = await CounterModel.findOneAndUpdate(
        { name: "productId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true },
      );
      this.productId = counter.value;
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("name") || this.isNew) {
    this.slug = `${slugify(this.name, { lower: true })}-${this.productId}`;
  }

  next();
});

// Indexes
productSchema.index({ name: 1, slug: 1 });
productSchema.index({ type: 1 });
productSchema.index({ name: "text" });

const ProductModel = mongoose.model("Product", productSchema);
module.exports = ProductModel;
