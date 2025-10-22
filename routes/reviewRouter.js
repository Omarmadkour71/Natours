const express = require("express");
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);
reviewRouter
  .route("/")
  .get(
    authController.restrictTo("user", "admin"),
    reviewController.getAllReviews
  )
  .post(
    authController.restrictTo("user", "admin"),
    reviewController.createReview
  );

reviewRouter
  .route("/:id")
  .delete(authController.restrictTo("user"), reviewController.deleteReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .get(reviewController.getReview);

module.exports = reviewRouter;
