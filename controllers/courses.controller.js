// let { courses } = require("../data/courses");

const { validationResult } = require("express-validator");
const Course = require("../models/course.model");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");

// get all courses
const getAllCourses = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
});
// get single course

const getCourseById = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    const error = appError.create(
      "course not found ",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { course } });

  return res.status(400).json({
    status: httpStatusText.ERROR,
    data: null,
    message: err.message,
    code: 400,
  });
});

const createCousre = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }
  const newCourse = new Course(req.body);
  await newCourse.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { course: newCourse },
  });
});

// update a course
const updateCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.courseId;
  const updatedCourse = await Course.updateOne(
    { _id: courseId },
    { $set: { ...req.body } }
  );
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { course: updatedCourse },
  });
});

//  delete a course
const deleteCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.courseId;
  await Course.deleteOne({ _id: courseId });

  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllCourses,
  getCourseById,
  deleteCourse,
  updateCourse,
  createCousre,
};
