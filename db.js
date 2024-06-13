const mongoose = require("mongoose");
const url =
  "mongodb+srv://amirowaisy72:iVVKYSj5rugATyVg@cluster0.mpb1bfz.mongodb.net/ecommerce-osc-usersActivity";
mongoose.set("strictQuery", false);
// const url =
//   "mongodb+srv://amirowaisy72:iVVKYSj5rugATyVg@cluster0.mpb1bfz.mongodb.net/ecommerce-minnie-usersActivity";
// mongoose.set("strictQuery", false);

const connectToMongoose = () => {
  mongoose.connect(url);
  console.log("Connected to Mongo DB");
};

module.exports = connectToMongoose;
