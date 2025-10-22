const express = require("express");
const authController = require("../controller/authController");
const bookingController = require("../controller/bookingController");

const bookingRouter = express.Router();

bookingRouter.use(authController.protect);
bookingRouter
  .route("/checkout-session/:tourId")
  .get(bookingController.getCheckoutSession);

bookingRouter.use(authController.restrictTo("admin"));

bookingRouter
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route("/:id")
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRouter;
