const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("ID is not correct", 404));
    }
    res.status(204).json({
      status: "success",
      data: null
    });
  });

exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError("ID is not correct", 404));
    }
    res.status(200).json({
      status: "success",
      doc
    });
  });

exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      doc
    });
  });

exports.getOneDoc = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError("ID is not correct", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc
      }
    });
  });

exports.getAllDocs = (Model) =>
  catchAsync(async (req, res, next) => {
    let filteredObj = {};
    if (req.params.tourId) filteredObj = { tour: req.params.tourId };
    // Excuting Query
    const features = new APIFeatures(Model.find(filteredObj), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: {
        data: doc
      }
    });
  });

/* exports.getAllTours = catchAsync(async (req, res, next) => {
  // Excuting Query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .paginate();
  const tour = await features.query;
  res.status(200).json({
    status: "success",
    result: tour.length,
    data: {
      tour
    }
  });
}); */

/* exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate("reviews");
  // Tour.findOne({_id: req.params.id})
  if (!tour) {
    return next(new AppError("ID is not correct", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  });
}); */

/* exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "Success",
    tour: {
      newTour
    }
  });
}); */

/* exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError("ID is not correct", 404));
  }
  res.status(200).json({
    status: "success",
    tour
  });
}); */

/* exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError("ID is not correct", 404));
  }
  res.status(204).json({
    status: "success",
    data: null
  });
}); */
