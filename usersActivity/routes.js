const { getTodayUsers, getConnectedUserNames } = require("./utils");

const getTodayUsersHandler = (req, res) => {
  res.json(getTodayUsers());
};

const getConnectedUsersHandler = (req, res) => {
  res.json(getConnectedUserNames());
};

module.exports = {
  getTodayUsersHandler,
  getConnectedUsersHandler,
};
