const pool = require("../config/db");

async function isAdmin(phoneNumber) {
  try {
    // Use double quotes for column names in PostgreSQL
    const res = await pool.query(
      "SELECT id FROM users WHERE phone_number = $1 AND type='admin'",
      [phoneNumber]
    );
    console.log(phoneNumber);
    console.log(res.rows);
    return res.rows.length > 0; // If any rows are returned, the user is an admin
  } catch (error) {
    console.error("Ошибка при проверке прав администратора:", error);
    return false; // Return false in case of any error
  }
}

module.exports = {
  isAdmin,
};
