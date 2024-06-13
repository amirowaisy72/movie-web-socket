const { getConnectedUserNames } = require("./utils");
const Users = require("../Modals/Users");

const getTodayUsersHandler = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Users.find();

    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConnectedUsersHandler = (req, res) => {
  res.json(getConnectedUserNames());
};

module.exports = {
  getTodayUsersHandler,
  getConnectedUsersHandler,
};
