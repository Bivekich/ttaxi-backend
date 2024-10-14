const pool = require("../config/db");

// TODO: Проверка зареган ли пользователь, если да, то просто даем ссылку
const createUser = async (phoneNumber) => {
  const client = await pool.connect();
  try {
    const queryText =
      "INSERT INTO users (phone_number) VALUES ($1) RETURNING *";
    const result = await client.query(queryText, [phoneNumber]);
    return result.rows[0];
  } catch (error) {
    console.error("Ошибка при создании пользователя", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createUser,
};
