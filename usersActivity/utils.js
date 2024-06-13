const connectedUsers = new Map();
const todayUsersMap = new Map();

const getConnectedUserNames = () => {
  return [...connectedUsers.values()]
    .filter((user) => user.active)
    .map((user) => user.name);
};

const formatTime = (timeInMilliseconds) => {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} minutes, ${seconds} seconds`;
};

const getTodayUsers = () => {
  return [...todayUsersMap.entries()].map(([username, totalOnlineTime]) => ({
    username,
    totalOnlineMinutesToday: formatTime(totalOnlineTime),
  }));
};

const removeInactiveUsers = (io) => {
  const currentTime = Date.now();
  for (const [socketId, user] of connectedUsers.entries()) {
    if (currentTime - user.lastActivity > 30000) {
      connectedUsers.delete(socketId); // Remove the user
      io.emit("connectedUsers", getConnectedUserNames());
    } else {
      // If user is still active, add 10 seconds to their todayUsersMap entry
      todayUsersMap.set(user.name, (todayUsersMap.get(user.name) || 0) + 10000);
    }
  }
};

module.exports = {
  connectedUsers,
  todayUsersMap,
  getConnectedUserNames,
  formatTime,
  getTodayUsers,
  removeInactiveUsers,
};
