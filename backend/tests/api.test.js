const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");
const Student = require("../src/models/Student");
const calculateResult = require("../src/utils/calculateResult");

let server, base;
before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    base = `http://localhost:${server.address().port}/api/students`;
    resolve();
  });
}));
after(() => server.close());

const send = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

const valid = {
  name: "Asha", rollNo: "CS01", course: "CSE",
  subjects: [{ name: "Maths", marks: 90 }],
};

test("calculateResult: grade boundaries and status", () => {
  const g = (m) => calculateResult([{ name: "x", marks: m }]);
  assert.equal(g(75).grade, "A");
  assert.equal(g(74).grade, "B");
  assert.equal(g(60).grade, "B");
  assert.equal(g(59).grade, "C");
  assert.equal(g(40).grade, "C");
  assert.equal(g(39).grade, "Fail");
  assert.equal(g(40).status, "Pass");
  assert.equal(g(39).status, "Fail");
});

test("calculateResult: totals and percentage", () => {
  const r = calculateResult([{ name: "a", marks: 90 }, { name: "b", marks: 80 }]);
  assert.deepEqual(
    { t: r.totalMarks, m: r.maxMarks, p: r.percentage, g: r.grade },
    { t: 170, m: 200, p: 85, g: "A" }
  );
});

test("Student schema rejects marks above 100 and empty subjects", async () => {
  const doc = { name: "A", rollNo: "x1", course: "CSE", totalMarks: 1, maxMarks: 100,
    percentage: 1, grade: "Fail", status: "Fail" };
  await assert.rejects(new Student({ ...doc, subjects: [{ name: "M", marks: 101 }] }).validate());
  await assert.rejects(new Student({ ...doc, subjects: [] }).validate());
  await assert.doesNotReject(new Student({ ...doc, subjects: [{ name: "M", marks: 50 }] }).validate());
});

test("POST rejects missing fields and bad marks with 400", async () => {
  assert.equal((await send("POST", "", { name: "X" })).status, 400);
  for (const marks of [101, -1, "90"]) {
    const res = await send("POST", "", { ...valid, subjects: [{ name: "M", marks }] });
    assert.equal(res.status, 400);
  }
});

test("PUT validates partial bodies", async () => {
  const res = await send("PUT", "/507f1f77bcf86cd799439011", { subjects: [{ name: "M", marks: 500 }] });
  assert.equal(res.status, 400);
});

test("GET /top requires course and a sane limit", async () => {
  assert.equal((await send("GET", "/top")).status, 400);
  assert.equal((await send("GET", "/top?course=CSE&limit=0")).status, 400);
});

test("malformed id returns 404, bad JSON returns 400", async () => {
  assert.equal((await send("GET", "/not-an-id")).status, 404);
  const res = await fetch(base, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad",
  });
  assert.equal(res.status, 400);
});
