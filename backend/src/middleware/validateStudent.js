const { MIN_MARKS, MAX_MARKS_PER_SUBJECT } = require("../config/grading");

const isText = (v) => typeof v === "string" && v.trim().length > 0;

function collectErrors(body, partial) {
  const errors = [];

  for (const field of ["name", "rollNo", "course"]) {
    if (body[field] === undefined) {
      if (!partial) errors.push(`${field} is required`);
    } else if (!isText(body[field])) {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  if (body.subjects === undefined) {
    if (!partial) errors.push("subjects is required");
  } else if (!Array.isArray(body.subjects) || body.subjects.length === 0) {
    errors.push("subjects must be a non-empty array of { name, marks }");
  } else {
    body.subjects.forEach((s, i) => {
      if (!s || !isText(s.name)) errors.push(`subjects[${i}].name is required`);
      if (!s || s.marks === undefined) {
        errors.push(`subjects[${i}].marks is required`);
      } else if (
        typeof s.marks !== "number" ||
        !Number.isFinite(s.marks) ||
        s.marks < MIN_MARKS ||
        s.marks > MAX_MARKS_PER_SUBJECT
      ) {
        errors.push(
          `subjects[${i}].marks must be a number between ${MIN_MARKS} and ${MAX_MARKS_PER_SUBJECT}`
        );
      }
    });
  }
  return errors;
}

const validateStudent = (partial = false) => (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ errors: ["Request body must be a JSON object"] });
  }
  const errors = collectErrors(req.body, partial);
  if (errors.length) return res.status(400).json({ errors });
  next();
};

module.exports = validateStudent;
