const AppError = require("../utils/appError");

// Handling Errors Functions
const handleCastErrorDB = (err) => {
  const message = `${err.value} is invalid ID`;
  return new AppError(message, 400);
};
const handleDublicateErrorDB = (err) => {
  const message = `${err.keyValue.name} is Dublicate`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const message = `${err.message}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError("your token is invalid, please login again", 401);
const handleExpiredTokenError = () =>
  new AppError("your session has expired, please login agian", 401);

// Sending Errors in development Mode
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // B) Rendered Website
  return res.status(err.statusCode).render("error", {
    title: "something went wrong",
    msg: err.message
  });
};

// Sending errors in production mode
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    // Operational Error (Trusted Errors) => send error to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error => don't leak error details
    // 1) log error
    console.log(err);
    // 2) Send Message to the client
    return res.status(404).json({
      status: "error",
      message: "Something went wrong"
    });
  }

  // B) Rendered Website
  // Operational Error (Trusted Errors) => send error to the client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "something went wrong",
      msg: err.message
    });
  }

  // Programming or other unknown error => don't leak error details
  // 1) log error
  console.log(err);
  // 2) send message to the clinte
  return res.status(err.statusCode).render("error", {
    title: "something went Wrong",
    msg: "please try Again later!"
  });
};
// Error handling Middleware
module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    // Handling invalid id errors form mongoose
    if (err.name === "CastError") error = handleCastErrorDB(error);
    // Handling Validation errors from mongoose
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    // Handling dublicate fields errors
    if (err.code === 11000) error = handleDublicateErrorDB(error);
    // Handling invalid token errors
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    // Handling expired token errors
    if (err.name === "TokenExpiredError") error = handleExpiredTokenError();
    sendErrorProd(error, req, res);
  }
};
