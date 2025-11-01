const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // sending token via cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user: {
      user
    }
  });
};

// SIGN UP //
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

// LOGIN //
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if the email and password exist
  if (!email || !password) {
    return next(new AppError("please enter email and password", 400));
  }

  // 2) check if the password is right & email exists
  // .select("+password") => to show password in query
  const user = await Users.findOne({ email: email }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("worng email or password!", 400));
  }

  // 3) send token to the user
  createSendToken(user, 200, res);
});

// PROTECT //
exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting tokens and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    next(new AppError("please login to access this content", 401));
  }

  // 2) Token Verification
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if the user still exists
  const currentUser = await Users.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError("the user related to this token no longer exist!", 401)
    );
  }

  // 4) check if the password changed after login
  //console.log(currentUser.isPasswordChanged(decode.iat));
  if (currentUser.isPasswordChanged(decode.iat)) {
    return next(new AppError("password changed! please login again", 401));
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// RESTRICT TO //
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you are not authorized to do this action!"),
        403
      );
    }
    next();
  };

// FORGET PASSWORD //
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) getting the current user and validate email
  const currentUser = await Users.findOne({ email: req.body.email });
  if (!currentUser) {
    return next(new AppError("there is no user with this email!", 404));
  }

  // 2) creating the reset token
  const resetToken = currentUser.changePasswordToken();
  await currentUser.save({ validateBeforeSave: false });

  //console.log(resetToken);

  // 3) sending email to the user
  try {
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;
    new Email(currentUser, resetURL).sendPasswordReset();
    res.status(201).json({
      status: "success",
      message: "reset token sent to your email (valied for 10 minutes)"
    });
  } catch (err) {
    currentUser.passwordResetExpire = undefined;
    currentUser.passwordResetToken = undefined;
    await currentUser.save({ validateBeforeSave: false });
    return next(new AppError("there was an error sending the email!!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get the current user and check if he exist
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const currentUser = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });

  if (!currentUser) {
    return next(new AppError("invalid user or token expired!", 400));
  }
  // 2) Updating the password data
  currentUser.password = req.body.password;
  currentUser.confirmPassword = req.body.confirmPassword;
  currentUser.passwordResetToken = undefined;
  currentUser.passwordResetExpire = undefined;
  await currentUser.save();
  // 3) sending a token to user
  createSendToken(currentUser, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get current user
  const currentUser = await Users.findById(req.user.id).select("+password");

  // 2) check if the user exists and check if the current password is right
  if (
    !(await currentUser.checkPassword(
      req.body.currentPassword,
      currentUser.password
    ))
  ) {
    return next(new AppError("invalid email or password!", 401));
  }

  // 3) update password
  currentUser.password = req.body.password;
  currentUser.confirmPassword = req.body.confirmPassword;
  await currentUser.save();

  // 4) send login token to user
  createSendToken(currentUser, 201, res);
});

// TO CHECK IF THE USER IS LOGGED_IN IN RENDERED PAGES
exports.isLoggedIn = async (req, res, next) => {
  // getting token and checking if its true
  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // check if the user exist
      const currentUser = await Users.findById(decode.id);
      if (!currentUser) {
        return next(
          new AppError("the user related to this token no longer exist!", 404)
        );
      }
      // check if the password changed after login
      if (currentUser.isPasswordChanged(decode.iat)) {
        return next(new AppError("password changed! please login again", 401));
      }
      res.locals.user = currentUser;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.loggout = (req, res) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: "success" });
};
