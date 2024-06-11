const handleMessage = (socket, io) => (message) => {
    io.emit("adminMessage", message);
  };
  
  module.exports = { handleMessage };
  