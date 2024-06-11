const { connectedUsers, todayUsersMap, getConnectedUserNames } = require("../utils");
const { emitConnectedUsers } = require("./emitConnectedUsers");

const handleDisconnect = (socket, io) => () => {
  if (connectedUsers.has(socket.id)) {
    const user = connectedUsers.get(socket.id);
    const currentTime = Date.now();
    const timeSpent = currentTime - user.lastActivity;
    todayUsersMap.set(user.name, (todayUsersMap.get(user.name) || 0) + timeSpent);
    connectedUsers.delete(socket.id);
    emitConnectedUsers(io);
  }
};

module.exports = { handleDisconnect };
