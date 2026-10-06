function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (err.code === 11000) {
    const value = err.keyValue ? Object.values(err.keyValue)[0] : "";
    return res.status(409).json({ error: `rollNo ${value} already exists` });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ errors: Object.values(err.errors).map((e) => e.message) });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { notFound, errorHandler };
