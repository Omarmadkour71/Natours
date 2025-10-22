const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");
const Users = require("../../models/userModel");
const Reviews = require("../../models/reviewModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  //console.log("connection Successful");
});

const tours = JSON.parse(fs.readFileSync("./dev-data/data/tours.json"));
const users = JSON.parse(fs.readFileSync("./dev-data/data/users.json"));
const reviews = JSON.parse(fs.readFileSync("./dev-data/data/reviews.json"));

const importData = async () => {
  try {
    await Tour.create(tours);
    await Users.create(users);
    await Reviews.create(reviews);
    console.log("data imported Succesfully");
  } catch (err) {
    console.log(`error while importing data to database: ${err}`);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Users.deleteMany();
    await Reviews.deleteMany();
    console.log("data deleted Succesfully");
  } catch (err) {
    console.log(`error while deleting data from database: ${err}`);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
