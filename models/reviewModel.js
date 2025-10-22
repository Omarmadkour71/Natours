const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "please enter your review"]
    },
    rating: {
      type: Number,
      required: [true, "please rate the tour"],
      min: [1, "rating must be more than 1"],
      max: [5, "rating must be less than 5"]
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "a review must belong to a tour"]
    },
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
      required: [true, "a review must belong to a user"]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// every user can write only 1 review on each tour
reviewSchema.index({ tour: 1, reviewer: 1 }, { unique: true });

// MIDDLEWARE FOR POPULATING TOUR AND USER IN REVIEW QUERIES
reviewSchema.pre(/^find/, function (next) {
  /* this.populate({
    path: "tour",
    select: "name"
  }).populate({
    path: "reviewer",
    select: "name"
  }); */
  this.populate({
    path: "reviewer",
    select: "name photo"
  });
  next();
});

// Static method for calculating averageRatings and quntity, and middleware for saving them
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRatings: { $avg: "$rating" }
      }
    }
  ]);
  //console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRatings
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async (doc) => {
  // the middleware will get the updated document as an argument
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
  }
});

// Creating Reviews Model
const Reviews = mongoose.model("Reviews", reviewSchema);

module.exports = Reviews;
