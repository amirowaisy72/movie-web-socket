const { getConnectedUserNames } = require("../utils");

const emitConnectedUsers = (io) => {
  io.emit("connectedUsers", getConnectedUserNames());
};

module.exports = { emitConnectedUsers };
