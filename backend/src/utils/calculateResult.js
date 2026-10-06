const config = require("../config/grading");

function calculateResult(subjects) {
  const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
  const maxMarks = subjects.length * config.MAX_MARKS_PER_SUBJECT;
  const percentage = Number(((totalMarks / maxMarks) * 100).toFixed(2));

  let grade = config.FAIL_GRADE;
  if (percentage >= config.PASS_PERCENTAGE) {
    const band = config.GRADE_BANDS.find((b) => percentage >= b.minPercentage);
    grade = band ? band.grade : config.FAIL_GRADE;
  }

  return {
    totalMarks,
    maxMarks,
    percentage,
    grade,
    status: grade === config.FAIL_GRADE ? "Fail" : "Pass",
  };
}

module.exports = calculateResult;
