// let { courses } = require("../data/courses");

// const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateJWT = require("../utils/generateJWT");

// get all courses
const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const Users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { Users } });
});

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  console.log("req.file ===", req.file);
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    avatar: req.file.filename,
  });
  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create(
      "user already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  await newUser.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { User: newUser },
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) {
    const error = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    return res.json({
      status: httpStatusText.SUCCESS,
      data: { token },
    });
  } else {
    const error = appError.create("something wrong", 500, httpStatusText.error);
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  login,
  register,
};
