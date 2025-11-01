const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [30, "a user name shouldn't be more than 30 characters"],
    minlength: [5, "a user name shouldn't be less than 5 characters"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a correct email"]
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  photo: {
    type: String,
    default: "default.jpg"
  },
  password: {
    type: String,
    required: [true, "a user must have a password"],
    minlength: [8, "a password should atleast have 8 characters"],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, "you must confirm your password"],
    validate: {
      // this validation ONLY works on CREATE and SAVE
      validator: function (val) {
        return val === this.password;
      },
      message: "passwords aren't matched"
    },
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// PASSWORD HASHING MIDDLEWARE
userSchema.pre("save", async function (next) {
  // exit this middleware function if the password didn't change
  if (!this.isModified("password")) return next();

  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// passwordChangedAt MIDDLEWARE
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// MIDDLEWARE FOR FINDING ACTIVE USERS ONLY
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// METHOD TO CHECK IF THE PASSWORD IS RIGHT
userSchema.methods.checkPassword = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

// METHOD TO CHECK IF THE PASSWORD IS CHANGED AFTER LOGIN
userSchema.methods.isPasswordChanged = function (JWTiat) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimeStamp, JWTiat);
    return JWTiat < changedTimeStamp;
  }
  return false;
};

// METHOD TO CREATE RESET TOKEN AND STORE IT
userSchema.methods.changePasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // add 10 minutes before token expiration
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
// CREATING USERS MODEL
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
