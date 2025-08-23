import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";

// Models
import CarouselModel from "../models/CarouselModel.js";
import FeatureImageModel from "../models/FeatureImageModel.js";
import GeneralInfoModel from "../models/GeneralInfoModel.js";
import ProductModel from "../models/ProductModel.js";
import UserModel from "../models/UserModel.js";
import BlogModel from "../models/BlogModel.js";
import StudentReviewModel from "../models/StudentReviewModel.js";
import TeacherProfileModel from "../models/TeacherProfileModel.js";
import FreeResourceModel from "../models/FreeResourceModel.js";
import PlatformInfoModel from "../models/PlatformInfoModel.js";
import ExamAttemptModel from "../models/ExamAttemptModel.js";


// Setup __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Collect used images
const usedImages = new Set();
const addImage = (img) => {
  if (img && typeof img === "string") {
    usedImages.add(img);
  }
};

const collectUsedImages = async () => {
  const carousels = await CarouselModel.find({}, "imgSrc");
  carousels.forEach((item) => {
    if (item.imgSrc) addImage(item.imgSrc);
  });

  const features = await FeatureImageModel.find({}, "imgSrc");
  features.forEach((item) => {
    if (item.imgSrc) addImage(item.imgSrc);
  });

  const infos = await GeneralInfoModel.find(
    {},
    "PrimaryLogo SecondaryLogo Favicon",
  );
  infos.forEach((item) => {
    if (item.PrimaryLogo) addImage(item.PrimaryLogo);
    if (item.SecondaryLogo) addImage(item.SecondaryLogo);
    if (item.Favicon) addImage(item.Favicon);
  });

  const products = await ProductModel.find(
    {},
    "thumbnailImage previewPdf modules",
  );
  products.forEach((product) => {
    if (product.thumbnailImage) addImage(product.thumbnailImage);
    if (product.previewPdf) addImage(product.previewPdf); // use addImage here for PDF
    product.modules?.forEach((module) => {
      module.lessons?.forEach((lesson) => {
        if (lesson.courseThumbnail) addImage(lesson.courseThumbnail);
      });
    });
  });

  const users = await UserModel.find({}, "userImage");
  users.forEach((user) => {
    if (user.userImage) addImage(user.userImage);
  });

  const blogs = await BlogModel.find({}, "thumbnailImage");
  blogs.forEach((blog) => {
    if (blog.thumbnailImage) addImage(blog.thumbnailImage);
  });

  const studentReviews = await StudentReviewModel.find({}, "imgSrc");
  studentReviews.forEach((review) => {
    if (review.imgSrc) addImage(review.imgSrc);
  });

  const teachers = await TeacherProfileModel.find({}, "teachersImg");
  teachers.forEach((teacher) => {
    if (teacher.teachersImg) addImage(teacher.teachersImg);
  });

  const platform = await PlatformInfoModel.find({}, "platformThumbnail");
  platform.forEach((teacher) => {
    if (teacher.platformThumbnail) addImage(teacher.platformThumbnail);
  });

  const freeResources = await FreeResourceModel.find(
    {},
    "resourceThumbnailImage resourcePdf",
  );

  freeResources.forEach((resource) => {
    if (resource.resourceThumbnailImage)
      addImage(resource.resourceThumbnailImage);
    if (resource.resourcePdf) addImage(resource.resourcePdf); // use addImage here for PDF too
  });
};

// --- Collect from ExamAttempt answers ---
const examAttempts = await ExamAttemptModel.find({}, "subjectAttempts");
examAttempts.forEach((attempt) => {
  attempt.subjectAttempts?.forEach((subject) => {
    subject.answers?.forEach((ans) => {
      if (ans.answer && typeof ans.answer === "string") {
        const val = ans.answer.toLowerCase();
        if (
          val.endsWith(".jpg") ||
          val.endsWith(".jpeg") ||
          val.endsWith(".png") ||
          val.endsWith(".gif") ||
          val.endsWith(".webp") ||
          val.endsWith(".pdf")
        ) {
          addImage(ans.answer);
        }
      }
    });
  });
});

await collectUsedImages();

// Delete unused images
const uploadsDir = path.join(__dirname, "../uploads");

fs.readdir(uploadsDir, (err, allFiles) => {
  if (err) {
    console.error("❌ Failed to read uploads directory:", err);
    process.exit(1);
  }

  const unusedFiles = allFiles.filter((file) => !usedImages.has(file));
  let deletedCount = 0;

  unusedFiles.forEach((file) => {
    const fullPath = path.join(uploadsDir, file);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`❌ Failed to delete ${file}:`, err);
      } else {
        deletedCount++;
        if (deletedCount === unusedFiles.length) {
          console.log(
            `✅ Cleanup complete. ${deletedCount} unused image(s) deleted.`,
          );
          process.exit();
        }
      }
    });
  });

  if (unusedFiles.length === 0) {
    console.log("✅ No unused images to delete. Uploads folder is clean.");
    process.exit();
  }
});
