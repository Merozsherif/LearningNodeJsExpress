const express = require("express");
require("dotenv").config();
const app = express();
const httpStatusText = require("./utils/httpStatusText");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const url = process.env.MONGO_URL;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(url).then(() => {
  console.log("mangodb server started ");
});

app.use(cors());
app.use(express.json());

const coursesRouter = require("./routes/courses.route");
const usersRouter = require("./routes/user.route");
const multer = require("multer");

app.use("/api/courses", coursesRouter);
app.use("/api/users", usersRouter);

//  global middlewarre for not found router
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "this resource in not available",
  });
});

//  global error handler
app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    status: error.StatusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 4000, () => {});
