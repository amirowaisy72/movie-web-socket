const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { handleSocketConnection } = require("./usersActivity/socketHandlers/index");
const { setCronJobs } = require("./usersActivity/cronJobs");
const {
  getTodayUsersHandler,
  getConnectedUsersHandler,
} = require("./usersActivity/routes");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000;

// Initialize Socket.IO connection handler
io.on("connection", (socket) => {
  handleSocketConnection(socket, io);
});

// Define routes
app.get("/todayUsers", getTodayUsersHandler);
app.get("/connectedUsers", getConnectedUsersHandler);

// Set up cron jobs
setCronJobs(io);

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
