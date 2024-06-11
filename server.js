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

// Maintain a map of user names to their total online time for today
const todayUsersMap = new Map();

// Helper function to get an array of user names
const getConnectedUserNames = () => {
  return [...connectedUsers.values()]
    .filter((user) => user.active)
    .map((user) => user.name);
};

// Helper function to format time in "minutes:seconds"
const formatTime = (timeInMilliseconds) => {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} minutes, ${seconds} seconds`;
};

// Helper function to calculate and emit todayUsers
const getTodayUsers = () => {
  return [...todayUsersMap.entries()].map(([username, totalOnlineTime]) => ({
    username,
    totalOnlineMinutesToday: formatTime(totalOnlineTime),
  }));
};

// Function to remove a user from connectedUsers if there's no activity for 30 seconds
const removeInactiveUsers = () => {
  const currentTime = Date.now();
  for (const [socketId, user] of connectedUsers.entries()) {
    if (currentTime - user.lastActivity > 30000) {
      // 30 seconds
      const timeSpent = currentTime - user.lastActivity;
      todayUsersMap.set(user.name, (todayUsersMap.get(user.name) || 0) + timeSpent);
      connectedUsers.delete(socketId); // Remove the user
      io.emit("connectedUsers", getConnectedUserNames());
    }
  }
};

// Function to reset the todayUsersMap at midnight
const resetTodayUsers = () => {
  todayUsersMap.clear();
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
      });
      // Initialize total online time for today if not already present
      if (!todayUsersMap.has(name)) {
        todayUsersMap.set(name, 0);
      }
      io.emit("connectedUsers", getConnectedUserNames());
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
      const user = connectedUsers.get(socket.id);
      const currentTime = Date.now();
      const timeSpent = currentTime - user.lastActivity;
      todayUsersMap.set(user.name, (todayUsersMap.get(user.name) || 0) + timeSpent);
      connectedUsers.delete(socket.id);
      io.emit("connectedUsers", getConnectedUserNames());
    }
  });
s
  // Listen for user activity events
  socket.on("userActivity", () => {
    // Update the user's last activity timestamp and set them as active
    if (connectedUsers.has(socket.id)) {
      const user = connectedUsers.get(socket.id);
      const currentTime = Date.now();
      const timeSpent = currentTime - user.lastActivity;
      todayUsersMap.set(user.name, (todayUsersMap.get(user.name) || 0) + timeSpent);
      user.lastActivity = currentTime;
      user.active = true;
      io.emit("connectedUsers", getConnectedUserNames());
    }
  });
});

// Check for inactive users every 10 seconds
setInterval(removeInactiveUsers, 10000);

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

// Add an endpoint to serve todayUsers data
app.get("/todayUsers", (req, res) => {
  res.json(getTodayUsers());
});

// Add an endpoint to serve connected users data
app.get("/connectedUsers", (req, res) => {
  res.json(getConnectedUserNames());
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
