const { getConnectedUserNames } = require("./utils");
const Users = require("../Modals/Users");

const getTodayUsersHandler = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    // Create Date objects representing the start and end of the day in UTC
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of the day in UTC

    // Query to fetch users whose `date` field falls within the given day
    const users = await Users.find({
      date: {
        $gte: startOfDay.toISOString(), // Use ISO string format
        $lt: endOfDay.toISOString(), // Use ISO string format
      },
    });

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
