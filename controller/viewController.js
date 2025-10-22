const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Bookings = require("../models/bookingModel");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "Overview",
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user"
  });
  if (!tour) {
    return next(new AppError("no tour was found! please try Again", 404));
  }
  res.status(200).render("tour", {
    title: tour.name,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account"
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "My Account"
  });
};

// user Booking page
exports.getMyBookings = async (req, res) => {
  // (1) get user bookings
  const userBookings = await Bookings.find({ user: req.user.id });

  // (2) find tours with the returned id
  const tourIds = userBookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  // (2) send booking to the page
  res.status(200).render("overview", {
    title: "My Bookings",
    tours
  });
};
