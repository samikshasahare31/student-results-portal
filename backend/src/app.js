const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/students", studentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
