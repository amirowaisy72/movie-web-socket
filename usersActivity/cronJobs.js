const geoip = require("geoip-lite");

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
        // Extract existing minutes and seconds, defaulting to 0 if NaN
        let [existingMinutes, existingSeconds] = user.totalOnlineTime
          .split(", ")
          .map((part) => parseInt(part.split(" ")[0]));

        existingMinutes = isNaN(existingMinutes) ? 0 : existingMinutes;
        existingSeconds = isNaN(existingSeconds) ? 0 : existingSeconds;

        // Extract new minutes and seconds
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
        let city = "Default";
        let country = "Default";

        try {
          // Extract the IP address from the username string
          const ipMatch = username.match(/IP:([\d.]+)/);
          const ipAddress = ipMatch ? ipMatch[1] : null;

          if (ipAddress) {
            // Use geoip-lite to get city and country
            const geo = geoip.lookup(ipAddress);
            if (geo) {
              city = geo.city || "Default";
              country = geo.country || "Default";
            }
          }
        } catch (error) {
          console.error("Error fetching city and country:", error);
          // city and country remain "Default"
        }

        // Create a new user with the extracted or default city and country
        await Users.create({
          username,
          totalOnlineTime: totalOnlineMinutesToday,
          date: endOfToday,
          city, // New field for city
          country, // New field for country
        });
      }
    }

    // Reset todayUsersMap
    todayUsersMap.clear();
  }, 600000); // 600000  ms = 10 minutes
};

module.exports = { setCronJobs };
