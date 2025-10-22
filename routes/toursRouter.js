const express = require("express");
const toursController = require("../controller/toursController");
const authController = require("../controller/authController");
const reviewRouter = require("./reviewRouter");

const toursRouter = express.Router();

//toursRouter.param("id", toursController.checkID);

toursRouter
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("guides", "lead-guide", "admin"),
    toursController.tourMonthlyPlan
  );

toursRouter.route("/tours-stats").get(toursController.getTourStats);

toursRouter
  .route("/top-5-tours")
  .get(toursController.topToursAlias, toursController.getAllTours);

// /tours-within/233/center/34.111745,-118.113491/unit/mi
toursRouter
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(toursController.getToursWithin);
// /distances/34.111745,-118.113491/unit/mi
toursRouter
  .route("/distances/:latlng/unit/:unit")
  .get(toursController.getDistances);

toursRouter
  .route("/")
  .get(toursController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.createTour
  );

toursRouter
  .route("/:id")
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    toursController.deleteTour
  );

// nested route for reviews of a tour
toursRouter.use("/:tourId/reviews", reviewRouter);

module.exports = toursRouter;
