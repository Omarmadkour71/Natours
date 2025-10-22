const Reviews = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.reviewer) req.body.reviewer = req.user.id;
  const review = await Reviews.create(req.body);
  res.status(201).json({
    status: "success",
    review
  });
});

exports.getAllReviews = factory.getAllDocs(Reviews);
exports.deleteReview = factory.deleteDoc(Reviews);
exports.updateReview = factory.updateDoc(Reviews);
exports.getReview = factory.getOneDoc(Reviews);
