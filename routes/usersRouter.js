const express = require("express");
const path = require("path");
const usersController = require("../controller/usersController");
const authController = require("../controller/authController");

// Creating a router to handle all routes related to users
const usersRouter = express.Router();

// Routes for signing up && reseting password
usersRouter.route("/signup").post(authController.signUp);
usersRouter.route("/login").post(authController.login);
usersRouter.route("/logout").get(authController.loggout);
usersRouter.route("/forgotpassword").post(authController.forgotPassword);
usersRouter.route("/resetpassword/:token").patch(authController.resetPassword);

// Middleware to protect all route from this point
usersRouter.use(authController.protect);

// Routes for updating and deleting profile
usersRouter
  .route("/updateMyPassword")
  .patch(authController.protect, authController.updatePassword);
usersRouter
  .route("/updateMyProfile")
  .patch(
    authController.protect,
    usersController.uploadPhoto,
    usersController.resizeUserPhoto,
    usersController.updatedMyProfile
  );
usersRouter
  .route("/deleteMyProfile")
  .delete(authController.protect, usersController.deleteMyProfile);

// Middleware to restrict access to admin only from this point
usersRouter.use(authController.restrictTo("admin"));

// Routes for the CRUD Operations
usersRouter
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

usersRouter
  .route("/myProfile")
  .get(authController.protect, usersController.getMe, usersController.getUser);

usersRouter
  .route("/:id")
  .delete(usersController.deleteUser)
  .patch(usersController.updateUser)
  .get(usersController.getUser);

module.exports = usersRouter;
