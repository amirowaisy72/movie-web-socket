const { handleNewConnection } = require("./handleNewConnection");
const { handleMessage } = require("./handleMessage");
const { handleDisconnect } = require("./handleDisconnect");

const handleSocketConnection = (socket, io) => {
  socket.on("newConnection", handleNewConnection(socket, io));
  socket.on("message", handleMessage(socket, io));
  socket.on("disconnect", handleDisconnect(socket, io));
};

module.exports = { handleSocketConnection };
