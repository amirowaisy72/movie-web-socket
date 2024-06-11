const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000;

// Maintain a map of socket IDs to user names along with their last activity timestamp
const connectedUsers = new Map();

// Helper function to get an array of user names
const getConnectedUserNames = () => {
  return [...connectedUsers.values()]
    .filter((user) => user.active)
    .map((user) => user.name);
};

// Helper function to calculate and emit todayUsers
const emitTodayUsers = () => {
  const todayUsers = [...connectedUsers.values()].map((user) => ({
    username: user.name,
    totalOnlineMinutesToday: `${Math.floor(user.totalOnlineTime / 60000)} minutes`,
  }));
  io.emit("todayUsers", todayUsers);
};

// Function to remove a user from connectedUsers if there's no activity for 30 seconds
const removeInactiveUsers = () => {
  const currentTime = Date.now();
  for (const [socketId, user] of connectedUsers.entries()) {
    if (currentTime - user.lastActivity > 30000) {
      // 30 seconds
      user.active = false; // Mark user as inactive
      io.emit("connectedUsers", getConnectedUserNames());
      emitTodayUsers(); // Emit updated todayUsers list
    }
  }
};

// Socket.IO connection handler
io.on("connection", (socket) => {
  // Listen for the user's name from the client
  socket.on("newConnection", (name) => {
    // Check if the user already exists in the map
    const userExists = [...connectedUsers.values()].some(
      (user) => user.name === name
    );

    // If the user does not exist, add them to the map
    if (!userExists) {
      connectedUsers.set(socket.id, {
        name,
        lastActivity: Date.now(),
        active: true,
        totalOnlineTime: 0, // Initialize total online time
      });
      io.emit("connectedUsers", getConnectedUserNames());
      emitTodayUsers(); // Emit updated todayUsers list
    } else {
      // If user exists, update their socket ID and last activity timestamp
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
  });

  socket.on("message", (message) => {
    io.emit("adminMessage", message);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    // Remove the user from connectedUsers
    if (connectedUsers.has(socket.id)) {
      connectedUsers.delete(socket.id);
      io.emit("connectedUsers", getConnectedUserNames());
      emitTodayUsers(); // Emit updated todayUsers list
    }
  });

  // Listen for user activity events
  socket.on("userActivity", () => {
    // Update the user's last activity timestamp and set them as active
    if (connectedUsers.has(socket.id)) {
      const user = connectedUsers.get(socket.id);
      const currentTime = Date.now();
      user.totalOnlineTime += currentTime - user.lastActivity;
      user.lastActivity = currentTime;
      if (!user.active) {
        user.active = true;
        io.emit("connectedUsers", getConnectedUserNames());
      }
      emitTodayUsers(); // Emit updated todayUsers list
    }
  });
});

// Check for inactive users every 10 seconds
setInterval(removeInactiveUsers, 10000);

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
