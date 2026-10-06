const mongoose = require("mongoose");
const { MIN_MARKS, MAX_MARKS_PER_SUBJECT } = require("../config/grading");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Subject name is required"], trim: true },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [MIN_MARKS, `Marks cannot be below ${MIN_MARKS}`],
      max: [MAX_MARKS_PER_SUBJECT, `Marks cannot be above ${MAX_MARKS_PER_SUBJECT}`],
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    course: { type: String, required: [true, "Course is required"], trim: true, index: true },
    subjects: {
      type: [subjectSchema],
      validate: [(v) => v.length > 0, "At least one subject is required"],
    },
    // Calculated on the server
    totalMarks: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    percentage: { type: Number, required: true, index: true },
    grade: { type: String, enum: ["A", "B", "C", "Fail"], required: true },
    status: { type: String, enum: ["Pass", "Fail"], required: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

module.exports = mongoose.model("Student", studentSchema);
