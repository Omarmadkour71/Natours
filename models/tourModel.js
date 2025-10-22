const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A name is required for the tour"],
      unique: true,
      trim: true,
      maxlength: [40, "A name should have less than 40 characters"],
      minlength: [5, "A name should have more than 5 characters"]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have max group size"]
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "a tour difficulty must be easy, medium or difficult"
      }
    },
    ratingsAverage: {
      type: Number,
      required: [true, "A Tour must have a rating"],
      min: [1, "Ratings must be above 1.0"],
      max: [5, "Ratings must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "A tour Must have a imageCover"]
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    price: {
      type: Number,
      required: [true, "A price is required fot the tour"]
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "a discount should be cheaper than tour price"
      }
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// INDEXES FOR THE SCHEMA
tourSchema.index({ price: 1, ratingsAverage: -1 }); // price ASC / ratingsAvg DESC
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

// MIDDLEWARE FOR POPULATING GUIDE USERS IN TOURS
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  });
  next();
});

// VIRTUAL POPULATE
tourSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "tour", // name of the field which tour is being refrenced(at Reviews model)
  localField: "_id"
});
// VIRTUAL PROPERTIES
tourSchema.virtual("durationInWeek").get(function () {
  return Math.floor((this.duration / 7) * 10) / 10;
});

// DOCUMENT MIDDLEWARE
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// QUERY MIDDLEWARE POST QUERY
/* tourSchema.post(/^find/, function (docs, next) {
  console.log(docs);
  next();
  }); */

// AGGREGATE MIDDLEWARE
//tourSchema.pre("aggregate", function (next) {
//  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//  next();
//});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
