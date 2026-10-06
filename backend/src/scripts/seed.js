require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Student = require("../models/Student");
const calculateResult = require("../utils/calculateResult");

const raw = [
  ["Asha Patil", "CS101", "CSE", [92, 88, 95]],
  ["Ravi Kulkarni", "CS102", "CSE", [65, 70, 58]],
  ["Sneha Joshi", "CS103", "CSE", [81, 77, 85]],
  ["Karan Mehta", "CS104", "CSE", [32, 28, 45]],
  ["Priya Nair", "CS105", "CSE", [48, 55, 52]],
  ["Aman Shaikh", "EC101", "ECE", [78, 82, 74]],
  ["Neha Deshmukh", "EC102", "ECE", [90, 94, 89]],
  ["Rohit Jadhav", "EC103", "ECE", [35, 40, 38]],
  ["Isha Verma", "ME101", "Mechanical", [68, 72, 64]],
  ["Vikram Rao", "ME102", "Mechanical", [55, 61, 49]],
];
const subjectNames = ["Mathematics", "Core Subject", "Practicals"];

(async () => {
  await connectDB();
  await Student.deleteMany({});
  const docs = raw.map(([name, rollNo, course, marks]) => {
    const subjects = marks.map((m, i) => ({ name: subjectNames[i], marks: m }));
    return { name, rollNo, course, subjects, ...calculateResult(subjects) };
  });
  await Student.insertMany(docs);
  console.log(`Seeded ${docs.length} students`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
