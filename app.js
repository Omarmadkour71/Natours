const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
const perfectSanitize = require("perfect-express-sanitizer");
const expressSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const toursRouter = require("./routes/toursRouter");
const usersRouter = require("./routes/usersRouter");
const reviewRouter = require("./routes/reviewRouter");
const viewRouter = require("./routes/viewRouter");
const bookingRouter = require("./routes/bookingRouter");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.set("query parser", "extended");

// GLOBALE MIDDLEWARES
// serving static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to allow express to change properity of req.body
app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value: req.query,
    writable: true
  });
  next();
});

//secure http headers
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://cdn.jsdelivr.net",
  "https://js.stripe.com/v3/"
];
const styleSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://fonts.googleapis.com/"
];
const connectSrcUrls = [
  "https://unpkg.com",
  "https://tile.openstreetmap.org",
  "https://cdn.jsdelivr.net",
  "https://js.stripe.com/v3/",
  "ws://127.0.0.1:*",
  "ws://localhost:*"
];
const fontSrcUrls = ["fonts.googleapis.com", "fonts.gstatic.com"];

//set security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:", "https:"],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  })
);

// body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cookieParser());

// testing Middleware
app.use((req, res, next) => {
  //console.log(req.cookies);
  next();
});

//app.use(expressSanitize());

// data sanitization against XSS & noSQL query injection
app.use((req, res, next) => {
  // Skip sanitizer for file uploads
  if (req.is("multipart/form-data")) return next();

  // Otherwise, apply sanitizer
  perfectSanitize.clean({
    xss: true,
    noSql: true,
    sql: true
  })(req, res, next);
});

// prevent parameters pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "difficulty",
      "ratingsAverage",
      "ratingsQuantity",
      "price"
    ]
  })
);

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limiting requests from API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request in short time! please try again later"
});
app.use("/api", limiter);

// ROUTES
//app.use("/login", viewRouter);
app.use("/", viewRouter);
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// ERROR HANDLING FOR WRONG URLS
app.all("/{*any}", (req, res, next) => {
  /* const err = new Error(`couldn't find ${req.originalUrl} on the server`);
  err.statusCode = 404;
  err.status = "fail"; */
  next(new AppError(`couldn't find ${req.originalUrl} on the server`, 404));
});

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
