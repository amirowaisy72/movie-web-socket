const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;

// Function to get the current date in Karachi timezone
const getKarachiTime = () => moment.tz("Asia/Karachi").toDate();

const userSchema = new Schema({
  username: { type: String, required: true },
  totalOnlineTime: { type: String, default: "0 minutes, 0 seconds" },
  date: { type: Date, default: getKarachiTime },
});

module.exports = mongoose.model("Users", userSchema);
