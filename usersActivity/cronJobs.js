const { removeInactiveUsers, resetTodayUsers } = require("./utils");

const setCronJobs = (io) => {
  // Check for inactive users every 10 seconds
  setInterval(() => removeInactiveUsers(io), 10000);

  // Schedule the reset of todayUsersMap at midnight
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const timeToMidnight = midnight - now;
  setTimeout(() => {
    resetTodayUsers();
    setInterval(resetTodayUsers, 24 * 60 * 60 * 1000);
  }, timeToMidnight);
};

module.exports = { setCronJobs };
