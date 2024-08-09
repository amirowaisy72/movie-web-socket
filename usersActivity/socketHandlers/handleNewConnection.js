const { connectedUsers, todayUsersMap } = require("../utils");
const { emitConnectedUsers } = require("./emitConnectedUsers");

const handleNewConnection = (socket, io) => (name) => {
  const userExists = [...connectedUsers.values()].some(
    (user) => user.name === name
  );

  if (!userExists) {
    connectedUsers.set(socket.id, {
      name,
      lastActivity: Date.now(),
      active: true,
    });
    if (!todayUsersMap.has(name)) {
      todayUsersMap.set(name, 0);
    }
    emitConnectedUsers(io);
  } else {
    connectedUsers.forEach((user, socketId) => {
      if (user.name === name) {
        connectedUsers.set(socketId, {
          ...user,
          lastActivity: Date.now(),
          active: true,
        });
      }
    });
  }
};

module.exports = { handleNewConnection };
