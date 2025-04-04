// Import required modules
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// Import routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const blobRouter = require("./routes/blob");
const authRouter = require("./routes/auth");
const manuscriptsRouter = require("./routes/manuscripts");

// Initialize Express app
const app = express();

// Configure middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/blob", blobRouter);
app.use("/api/auth", authRouter);
app.use("/api/manuscripts", manuscriptsRouter);

// 404 error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Respond with error
  res.status(err.status || 500).json({
    error: err.message,
    details: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
