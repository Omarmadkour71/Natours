const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsync = require("../utils/catchAsync");
const Tours = require("../models/tourModel");
const Bookings = require("../models/bookingModel");
const factory = require("./handlerFactory");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // (1) get tour from the database
  const tour = await Tours.findById(req.params.tourId);

  // (2) create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?user=${req.user.id}&tour=${tour.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100, // cent
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: tour.images
          }
        },
        quantity: 1
      }
    ],
    mode: "payment"
  });

  // (3) send session as a response
  res.status(200).json({
    status: "success",
    session
  });
});

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { user, tour, price } = req.query;
  if (!user || !tour || !price) return next();

  await Bookings.create({ user, tour, price });
  res.redirect(req.originalUrl.split("?")[0]);
});

// CRUD Operations
exports.getAllBookings = factory.getAllDocs(Bookings);
exports.createBooking = factory.createDoc(Bookings);
exports.getOneBooking = factory.getOneDoc(Bookings);
exports.updateBooking = factory.updateDoc(Bookings);
exports.deleteBooking = factory.deleteDoc(Bookings);
