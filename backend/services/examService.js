const Exam = require("../models/ExamModel");
const mongoose = require("mongoose");

const createExam = async (data) => {
  const exam = new Exam(data);
  await exam.save();
  return exam;
};

const getAllExams = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [exams, total] = await Promise.all([
    Exam.find().select("-subjects").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Exam.countDocuments(),
  ]);
  return { exams, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getExamById = async (id, options = {}) => {
  const { subjectsPage = 1, subjectsLimit = 10, questionsPage = 1, questionsLimit = 10 } = options;
  const loadQuestions = questionsPage > 0;

  let exam, subjects;

  if (!loadQuestions) {
    // Use aggregation to get subject metadata + per-subject question counts via $size,
    // without loading any question content — stays tiny regardless of exam size
    const subjectsSkip = (subjectsPage - 1) * subjectsLimit;
    const [result] = await Exam.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $project: {
        title: 1, description: 1, status: 1, productIds: 1, isFree: 1,
        durationMin: 1, totalMarks: 1, totalQuestions: 1, examId: 1, slug: 1,
        createdAt: 1, updatedAt: 1,
        subjectsTotal: { $size: '$subjects' },
        subjects: {
          $map: {
            input: { $slice: ['$subjects', subjectsSkip, subjectsLimit] },
            as: 'sub',
            in: {
              _id: '$$sub._id',
              title: '$$sub.title',
              description: '$$sub.description',
              timeLimitMin: '$$sub.timeLimitMin',
              questionsCount: { $size: '$$sub.questions' },
            }
          }
        }
      }}
    ]);

    if (!result) return null;

    subjects = (result.subjects || []).map(sub => ({
      ...sub,
      questions: [],
      questionsPagination: {
        page: 0,
        limit: 0,
        total: sub.questionsCount,
        hasMore: sub.questionsCount > 0
      }
    }));

    return {
      ...result,
      subjects,
      pagination: {
        subjects: {
          page: subjectsPage,
          limit: subjectsLimit,
          total: result.subjectsTotal,
          totalQuestions: result.totalQuestions || 0,
          totalMarks: result.totalMarks || 0,
          totalTime: result.durationMin || 0,
          hasMore: (subjectsPage * subjectsLimit) < result.subjectsTotal
        }
      }
    };
  }

  exam = await Exam.findById(id);
  if (!exam) return null;

  // Pass already-loaded exam document to avoid a second Exam.findById call
  subjects = await getSubjectsByExamId(id, subjectsPage, subjectsLimit, questionsPage, questionsLimit, exam);

  const totalSubjects = exam.subjects?.length || 0;

  // Use pre-computed fields stored by the pre('save') hook instead of re-iterating all questions
  const totalQuestions = exam.totalQuestions || 0;
  const totalMarks = exam.totalMarks || 0;
  const totalTime = exam.durationMin || 0;

  return {
    ...exam.toObject(),
    subjects,
    pagination: {
      subjects: {
        page: subjectsPage,
        limit: subjectsLimit,
        total: totalSubjects,
        totalQuestions,
        totalMarks,
        totalTime,
        hasMore: (subjectsPage * subjectsLimit) < totalSubjects
      }
    }
  };
};

const updateExam = async (id, data) => {
  const exam = await Exam.findById(id);
  if (!exam) {
    return null;
  }

  // Update exam properties based on data
  // This will trigger the pre('save') hook when exam.save() is called
  Object.assign(exam, data);

  await exam.save();
  return exam;
};

const deleteExam = async (id) => {
  return Exam.findByIdAndDelete(id);
};

const patchExamMeta = async (id, data) => {
  const allowed = ['title', 'description', 'status', 'productIds', 'isFree'];
  const exam = await Exam.findById(id);
  if (!exam) return null;
  allowed.forEach(field => { if (data[field] !== undefined) exam[field] = data[field]; });
  await exam.save();
  return exam;
};

const reorderSubjects = async (id, orderedIds) => {
  const exam = await Exam.findById(id);
  if (!exam) return null;
  const map = new Map(exam.subjects.map(s => [s._id.toString(), s]));
  exam.subjects = orderedIds.map(sid => map.get(sid)).filter(Boolean);
  await exam.save();
  return exam;
};

const reorderQuestions = async (examId, subjectId, orderedIds) => {
  const exam = await Exam.findById(examId);
  if (!exam) return null;
  const subject = exam.subjects.id(subjectId);
  if (!subject) return null;
  const map = new Map(subject.questions.map(q => [q._id.toString(), q]));
  subject.questions = orderedIds.map(qid => map.get(qid)).filter(Boolean);
  await exam.save();
  return exam;
};

const getExamsByProductId = async (productId, page = 1, limit = 10) => {
  const filter = { productIds: productId, status: "published" };
  const skip = (page - 1) * limit;
  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .select("title totalMarks durationMin")
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit),
    Exam.countDocuments(filter),
  ]);
  return { exams, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getFreeExams = async () => {
  return Exam.find({ isFree: true, status: "published" })
    .select("-subjects")
    .sort({
      createdAt: -1,
    });
};

const getSubjectsByExamId = async (examId, subjectsPage = 1, subjectsLimit = 5, questionsPage = 1, questionsLimit = 10, examDoc = null) => {
  const exam = examDoc || await Exam.findById(examId);
  if (!exam || !exam.subjects) return [];
  
  const subjectsSkip = (subjectsPage - 1) * subjectsLimit;
  const paginatedSubjects = exam.subjects.slice(subjectsSkip, subjectsSkip + subjectsLimit);
  
  return paginatedSubjects.map(subject => {
    const totalQuestions = subject.questions?.length || 0;
    const showQuestions = questionsLimit > 0;
    
    if (!showQuestions) {
      return {
        _id: subject._id,
        title: subject.title,
        description: subject.description,
        timeLimitMin: subject.timeLimitMin,
        questions: [],
        questionsPagination: {
          page: 0,
          limit: 0,
          total: totalQuestions,
          hasMore: totalQuestions > 0
        }
      };
    }
    
    const questionsSkip = (questionsPage - 1) * questionsLimit;
    const paginatedQuestions = subject.questions?.slice(questionsSkip, questionsSkip + questionsLimit) || [];
    
    return {
      ...subject,
      questions: paginatedQuestions,
      questionsPagination: {
        page: questionsPage,
        limit: questionsLimit,
        total: totalQuestions,
        hasMore: (questionsPage * questionsLimit) < totalQuestions
      }
    };
  });
};

const getSubjectQuestions = async (examId, subjectIndex, questionsPage = 1, questionsLimit = 10) => {
  const exam = await Exam.findById(examId);
  if (!exam || !exam.subjects || !exam.subjects[subjectIndex]) return null;
  
  const subject = exam.subjects[subjectIndex];
  const questionsSkip = (questionsPage - 1) * questionsLimit;
  const paginatedQuestions = subject.questions?.slice(questionsSkip, questionsSkip + questionsLimit) || [];
  
  return {
    questions: paginatedQuestions,
    pagination: {
      page: questionsPage,
      limit: questionsLimit,
      total: subject.questions?.length || 0,
      hasMore: (questionsPage * questionsLimit) < (subject.questions?.length || 0)
    }
  };
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  getSubjectsByExamId,
  getSubjectQuestions,
  updateExam,
  deleteExam,
  patchExamMeta,
  reorderSubjects,
  reorderQuestions,
  getExamsByProductId,
  getFreeExams,
};
