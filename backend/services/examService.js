const Exam = require("../models/ExamModel");
const { invalidateExam } = require("../utils/redisClient");

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
  const exam = await Exam.findById(id);
  
  if (!exam) return null;
  
  let subjects;
  const loadQuestions = questionsPage > 0;
  
  if (!loadQuestions) {
    subjects = (exam.subjects || []).slice(0, subjectsLimit).map(sub => ({
      _id: sub._id,
      title: sub.title,
      description: sub.description,
      timeLimitMin: sub.timeLimitMin,
      questions: [],
      questionsPagination: {
        page: 0,
        limit: 0,
        total: sub.questions?.length || 0,
        hasMore: (sub.questions?.length || 0) > 0
      }
    }));
  } else {
    subjects = await getSubjectsByExamId(id, subjectsPage, subjectsLimit, questionsPage, questionsLimit);
  }
  
  const totalSubjects = exam.subjects?.length || 0;
  
  let totalQuestions = 0, totalMarks = 0, totalTime = 0;
  exam.subjects?.forEach(sub => {
    totalTime += sub.timeLimitMin || 0;
    totalQuestions += sub.questions?.length || 0;
    sub.questions?.forEach(q => {
      totalMarks += q.marks || 0;
    });
  });
  
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
  if (!exam) return null;
  Object.assign(exam, data);
  await exam.save();
  await invalidateExam(id.toString());
  return exam;
};

const deleteExam = async (id) => {
  return Exam.findByIdAndDelete(id);
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

const getSubjectsByExamId = async (examId, subjectsPage = 1, subjectsLimit = 5, questionsPage = 1, questionsLimit = 10) => {
  const exam = await Exam.findById(examId);
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
  getExamsByProductId,
  getFreeExams,
};
