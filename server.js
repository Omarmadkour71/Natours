const dotenv = require("dotenv");
const mongoose = require("mongoose");

// UNCAUGHT EXCEPTION ERRORS HANDLING
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message, err.stack);
  console.log("UNHandled Exception!! Shuting Down....");
  process.exit();
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

//console.log(process.env.NODE_ENV);
//console.log(app.get("env"));

// CONNECTING DATABASE
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  // eslint-disable-next-line prettier/prettier
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("connection Successful!");
});
mongoose.set("strictQuery", true);

// LISTENING TO THE PORT
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});

// UNHANDLED REJECTION ERRORS HANDLING
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHandled Rejection!! Shuting Down....");
  server.close(() => {
    process.exit();
  });
});
