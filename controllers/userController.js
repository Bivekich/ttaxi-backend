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

const getAllUsers = async (req, res) => {
  const client = await pool.connect();
  try {
    const queryText = "SELECT * FROM users ORDER BY id DESC";
    const result = await client.query(queryText);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении пользователей", error);
    throw error;
  } finally {
    client.release();
  }
};

const changeStatus = async (req, res) => {
  const { userId, newStatus } = req.body; // Получаем данные из тела запроса
  const client = await pool.connect();

  try {
    // Обновляем статус пользователя с указанным номером телефона
    const queryText = "UPDATE users SET type = $1 WHERE id = $2 RETURNING *";
    const result = await client.query(queryText, [newStatus, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json(result.rows[0]); // Отправляем обновленные данные пользователя
  } catch (error) {
    console.error("Ошибка при изменении статуса пользователя", error);
    res
      .status(500)
      .json({ message: "Ошибка при изменении статуса", error: error.message });
  } finally {
    client.release();
  }
};

const addUser = async (req, res) => {
  const { phoneNumber, status } = req.body; // Get data from request body

  try {
    // Check if the user already exists
    const checkUserQuery = "SELECT * FROM users WHERE phone_number = $1";
    const existingUserResult = await pool.query(checkUserQuery, [phoneNumber]);

    if (existingUserResult.rows.length > 0) {
      // User already exists
      return res.status(409).json({ message: "Пользователь уже существует" });
    }

    // If user does not exist, insert new user
    const queryText =
      "INSERT INTO users (phone_number, type) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(queryText, [phoneNumber, status]);

    res.status(201).json(result.rows[0]); // Respond with the created user
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const changeAdmin = async (req, res) => {
  const { pricePerMinute, column } = req.body; // Get data from request body

  try {
    // Check if column is allowed to be updated (for security)
    const allowedColumns = ["price_per_minute"]; // Add more allowed columns if needed
    if (!allowedColumns.includes(column)) {
      return res.status(400).json({ error: "Invalid column name" });
    }

    const queryText = `UPDATE admin_panel SET ${column} = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(queryText, [pricePerMinute, 1]); // Assuming you are updating a single record with id=1

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Admin settings not found" });
    }

    res.status(200).json(result.rows[0]); // Respond with the updated settings
  } catch (error) {
    console.error("Error updating admin settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to get the price per minute from admin settings
const getPricePerMinute = async (req, res) => {
  try {
    const queryText = "SELECT price_per_minute FROM admin_panel WHERE id = $1";
    const result = await pool.query(queryText, [1]); // Assuming there's only one record with id = 1

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({ pricePerMinute: result.rows[0].price_per_minute });
  } catch (error) {
    console.error("Error fetching price per minute:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllUsers,
  changeStatus,
  addUser,
  changeAdmin,
  getPricePerMinute, // Export the new function
};
