const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

redis.on("error", (err) => {
  // Log but don't crash — app works without Redis, just slower
  console.error("[Redis] connection error:", err.message);
});

const EXAM_TTL = 3600; // 1 hour

async function getExam(examId) {
  try {
    const cached = await redis.get(`exam:${examId}`);
    if (cached) return JSON.parse(cached);
  } catch (_) {}
  return null;
}

async function setExam(examId, examDoc) {
  try {
    await redis.set(`exam:${examId}`, JSON.stringify(examDoc), "EX", EXAM_TTL);
  } catch (_) {}
}

async function invalidateExam(examId) {
  try {
    await redis.del(`exam:${examId}`);
  } catch (_) {}
}

module.exports = { redis, getExam, setExam, invalidateExam };
