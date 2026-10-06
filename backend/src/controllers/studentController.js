const mongoose = require("mongoose");
const Student = require("../models/Student");
const calculateResult = require("../utils/calculateResult");
const asyncHandler = require("../utils/asyncHandler");

const trim = (v) => (typeof v === "string" ? v.trim() : v);
const cleanSubjects = (subjects) => subjects.map((s) => ({ name: trim(s.name), marks: s.marks }));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const caseInsensitive = (value) => ({ $regex: `^${escapeRegex(trim(value))}$`, $options: "i" });

exports.checkId = (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Student not found" });
  }
  next();
};

exports.createStudent = asyncHandler(async (req, res) => {
  const { name, rollNo, course, subjects } = req.body;
  const cleaned = cleanSubjects(subjects);
  const student = await Student.create({
    name: trim(name),
    rollNo: trim(rollNo),
    course: trim(course),
    subjects: cleaned,
    ...calculateResult(cleaned),
  });
  res.status(201).json(student);
});

exports.getStudents = asyncHandler(async (req, res) => {
  const { course, status, q } = req.query;
  const filter = {};
  if (course) filter.course = caseInsensitive(course);
  if (status) filter.status = caseInsensitive(status);
  if (q) {
    const rx = { $regex: escapeRegex(trim(q)), $options: "i" };
    filter.$or = [{ name: rx }, { rollNo: rx }];
  }
  const students = await Student.find(filter).sort({ createdAt: -1 });
  res.json({ count: students.length, students });
});

exports.getCourses = asyncHandler(async (req, res) => {
  const courses = (await Student.distinct("course")).sort((a, b) => a.localeCompare(b));
  res.json({ courses });
});

exports.getTopStudents = asyncHandler(async (req, res) => {
  const { course } = req.query;
  const limit = req.query.limit === undefined ? 5 : Number(req.query.limit);

  if (!course) return res.status(400).json({ error: "course query parameter is required" });
  if (!Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({ error: "limit must be a positive integer" });
  }

  const top = await Student.find({ course: caseInsensitive(course), status: "Pass" })
    .sort({ percentage: -1, name: 1 })
    .limit(limit);

  res.json({
    course,
    count: top.length,
    students: top.map((s, i) => ({ rank: i + 1, ...s.toJSON() })),
  });
});

exports.getStats = asyncHandler(async (req, res) => {
  const { course } = req.query;
  const match = course ? { course: caseInsensitive(course) } : {};

  const [summary] = await Student.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ["$status", "Pass"] }, 1, 0] } },
        average: { $avg: "$percentage" },
        highest: { $max: "$percentage" },
        lowest: { $min: "$percentage" },
      },
    },
  ]);
  const grades = await Student.aggregate([
    { $match: match },
    { $group: { _id: "$grade", count: { $sum: 1 } } },
  ]);

  const gradeDistribution = { A: 0, B: 0, C: 0, Fail: 0 };
  grades.forEach((g) => (gradeDistribution[g._id] = g.count));

  const total = summary ? summary.total : 0;
  const passed = summary ? summary.passed : 0;
  res.json({
    course: course || "All",
    total,
    passed,
    failed: total - passed,
    passPercentage: total ? Number(((passed / total) * 100).toFixed(2)) : 0,
    averagePercentage: total ? Number(summary.average.toFixed(2)) : 0,
    highest: total ? summary.highest : 0,
    lowest: total ? summary.lowest : 0,
    gradeDistribution,
  });
});

exports.getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const { name, rollNo, course, subjects } = req.body;
  if (name) student.name = trim(name);
  if (rollNo) student.rollNo = trim(rollNo);
  if (course) student.course = trim(course);
  if (subjects) {
    const cleaned = cleanSubjects(subjects);
    student.subjects = cleaned;
    Object.assign(student, calculateResult(cleaned));
  }

  await student.save();
  res.json(student);
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const deleted = await Student.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Student not found" });
  res.json({ message: "Student deleted" });
});
