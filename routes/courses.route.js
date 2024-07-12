const express = require("express");

const router = express.Router();
const coursesController = require("../controllers/courses.controller");
const { validationSchema } = require("../middlewares/validationSchema");
const verifyToken = require("../middlewares/verfiyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middlewares/allowedTo");

router
  .route("/")
  .get(coursesController.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.MANGER),
    validationSchema(),
    coursesController.createCousre
  );
router
  .route("/:courseId")
  .get(coursesController.getCourseById)
  .patch(coursesController.updateCourse)
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANGER),
    coursesController.deleteCourse
  );

module.exports = router;
