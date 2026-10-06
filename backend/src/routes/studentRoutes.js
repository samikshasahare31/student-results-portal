const express = require("express");
const c = require("../controllers/studentController");
const validateStudent = require("../middleware/validateStudent");

const router = express.Router();

router.param("id", c.checkId);

router.post("/", validateStudent(false), c.createStudent);
router.get("/", c.getStudents);
router.get("/courses", c.getCourses);
router.get("/top", c.getTopStudents);
router.get("/stats", c.getStats);
router.get("/:id", c.getStudent);
router.put("/:id", validateStudent(true), c.updateStudent);
router.delete("/:id", c.deleteStudent);

module.exports = router;
