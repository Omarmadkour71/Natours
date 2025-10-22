const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Users = require("../models/userModel");
const factory = require("./handlerFactory");

const filterData = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// MULTER CONFIGURATION
/* const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
}); */

const multerStorage = multer.memoryStorage(); // stores the image in req.file.buffer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image!, please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // set the filename so we can use it later
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// CRUD OPERATIONS
exports.getAllUsers = factory.getAllDocs(Users);
exports.getUser = factory.getOneDoc(Users);
exports.createUser = factory.createDoc(Users);
exports.updateUser = factory.updateDoc(Users);
exports.deleteUser = factory.deleteDoc(Users);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updatedMyProfile = catchAsync(async (req, res, next) => {
  // 1) check if the user sends password data to change
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "you can't change password here! please use /updatePassword"
      ),
      400
    );
  }
  // 2) update user document
  const filteredData = filterData(req.body, "name", "email");
  if (req.file) filteredData.photo = req.file.filename;
  const updatedUser = await Users.findByIdAndUpdate(req.user.id, filteredData, {
    new: true,
    runValidators: true
  });

  // 3) send response to user
  res.status(201).json({
    status: "success",
    updatedUser
  });
});

exports.deleteMyProfile = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});
