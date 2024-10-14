const pool = require("../config/db");

async function isAdmin(phoneNumber) {
  try {
    const res = await pool.query(
      "SELECT * FROM admins WHERE phone_number = $1",
      [phoneNumber]
    );
    return res.rows.length > 0;
  } catch (error) {
    console.error("Ошибка при проверке прав администратора:", error);
    return false;
  }
}

module.exports = {
  isAdmin,
};
