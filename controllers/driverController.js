const pool = require("../config/db"); // Assuming you have a db module for your connection

// Function to check if the user is a driver
const isDriver = async (phoneNumber) => {
  try {
    const queryText =
      "SELECT * FROM users WHERE phone_number = $1 AND type = 'driver'";
    const result = await pool.query(queryText, [phoneNumber]);

    return result.rows.length > 0; // Return true if the user is a driver
  } catch (error) {
    console.error("Error checking driver access:", error);
    throw error;
  }
};

module.exports = {
  isDriver,
};
