const connectedUsers = new Map();
const todayUsersMap = new Map();

const getConnectedUserNames = () => {
  return [...connectedUsers.values()]
    .filter((user) => user.active)
    .map((user) => ({
      name: user.name,
      referer: user.referer,
    }));
};

const formatTime = (timeInMilliseconds) => {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} minutes, ${seconds} seconds`;
};

const getTodayUsers = () => {
  return [...todayUsersMap.entries()].map(
    ([username, { totalOnlineTime, referer }]) => ({
      username,
      referer,
      totalOnlineMinutesToday: formatTime(totalOnlineTime),
    })
  );
};

const removeInactiveUsers = (io) => {
  const currentTime = Date.now();
  for (const [socketId, user] of connectedUsers.entries()) {
    if (currentTime - user.lastActivity > 30000) {
      connectedUsers.delete(socketId); // Remove the user
      io.emit("connectedUsers", getConnectedUserNames());
    } else {
      // If user is still active, add 10 seconds to their todayUsersMap entry
      const userData = todayUsersMap.get(user.name) || {
        totalOnlineTime: 0,
        referer: user.referer,
      };
      todayUsersMap.set(user.name, {
        totalOnlineTime: userData.totalOnlineTime + 10000,
        referer: userData.referer,
      });
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
