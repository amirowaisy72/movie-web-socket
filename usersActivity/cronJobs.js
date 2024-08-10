const {
  removeInactiveUsers,
  getTodayUsers,
  todayUsersMap,
} = require("./utils");
const Users = require("../Modals/Users");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const setCronJobs = (io) => {
  // Check for inactive users every 10 seconds
  setInterval(() => removeInactiveUsers(io), 10000);

  // Update MongoDB with todayUsersMap data every 10 minutes
  setInterval(async () => {
    const todayUsers = getTodayUsers();
    const endOfToday = moment.tz("Asia/Karachi").endOf("day").toDate();

    for (const { username, totalOnlineMinutesToday } of todayUsers) {
      const user = await Users.findOne({ username, date: endOfToday });

      if (user) {
        // Update existing user's totalOnlineTime
        const [existingMinutes, existingSeconds] = user.totalOnlineTime
          .split(", ")
          .map((part) => parseInt(part.split(" ")[0]));
        const [newMinutes, newSeconds] = totalOnlineMinutesToday
          .split(", ")
          .map((part) => parseInt(part.split(" ")[0]));

        let totalMinutes = existingMinutes + newMinutes;
        let totalSeconds = existingSeconds + newSeconds;

        // Handle overflow of seconds into minutes
        if (totalSeconds >= 60) {
          totalMinutes += Math.floor(totalSeconds / 60);
          totalSeconds %= 60;
        }

        user.totalOnlineTime = `${totalMinutes} minutes, ${totalSeconds} seconds`;
        await user.save();
      } else {
        // Create a new user
        await Users.create({
          username,
          totalOnlineTime: totalOnlineMinutesToday,
          date: endOfToday,
        });
      }
    }

    // Reset todayUsersMap
    todayUsersMap.clear();
  }, 600000); // 600000  ms = 10 minutes
};

module.exports = { setCronJobs };
