const pool = require("../config/db");

// Создать новый заказ
const createOrder = async (orderData) => {
  const {
    phoneNumber,
    status,
    pickupCoordinates,
    destinationCoordinates,
    pickupAddress,
    destinationAddress,
    yandexRouteLink,
    price,
    createdAt,
    completedAt,
  } = orderData;

  const insertOrderQuery = `
    INSERT INTO orders (
      phone_number, status, pickup_coordinates, destination_coordinates,
      pickup_address, destination_address, yandex_route_link, price,
      created_at, completed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`;

  const result = await pool.query(insertOrderQuery, [
    phoneNumber,
    status,
    pickupCoordinates,
    destinationCoordinates,
    pickupAddress,
    destinationAddress,
    yandexRouteLink,
    price,
    createdAt,
    completedAt,
  ]);

  return result.rows[0];
};

// Получить поездки пользователя по номеру телефона
const getUserRides = async (phoneNumber) => {
  const selectRidesQuery = `
    SELECT * FROM orders WHERE phone_number = $1 ORDER BY created_at DESC;
  `;
  const result = await pool.query(selectRidesQuery, [phoneNumber]);
  return result.rows;
};
// Получить поездки пользователя по номеру телефона
const getDriverRides = async (phoneNumber) => {
  const selectRidesQuery = `
    SELECT * FROM orders WHERE driver_phone = $1 ORDER BY created_at DESC;
  `;
  const result = await pool.query(selectRidesQuery, [phoneNumber]);
  return result.rows;
};

// Получить все поездки
const getAllRidesModel = async () => {
  const selectRidesQuery = `
    SELECT * FROM orders WHERE driver_phone IS NULL ORDER BY created_at DESC;
  `;
  const result = await pool.query(selectRidesQuery, []);
  return result.rows;
};

// Получить заказ по ID
const getOrderById = async (orderId) => {
  const selectOrderQuery = `
    SELECT * FROM orders WHERE id = $1;
  `;
  const result = await pool.query(selectOrderQuery, [orderId]);
  return result.rows[0];
};

const updateOrderStatus = async (
  orderId,
  status,
  pickupTime = null,
  endingTime = null
) => {
  // Начало SQL запроса
  let updateOrderQuery = `
    UPDATE orders
    SET status = $1
  `;

  // Массив значений для подстановки в запрос
  const queryParams = [status];

  // Проверяем, нужно ли обновлять pickup_time
  if (pickupTime !== null) {
    updateOrderQuery += `, pickup_time = $${queryParams.length + 1}`;
    queryParams.push(pickupTime);
  }

  // Проверяем, нужно ли обновлять ending_time
  if (endingTime !== null) {
    updateOrderQuery += `, ending_time = $${queryParams.length + 1}`;
    queryParams.push(endingTime);
  }

  // Заканчиваем SQL запрос добавлением условия WHERE
  updateOrderQuery += ` WHERE id = $${queryParams.length + 1} RETURNING *;`;
  queryParams.push(orderId);

  // Выполняем запрос
  const result = await pool.query(updateOrderQuery, queryParams);

  return result.rows[0];
};

const updateOrderDriverPhone = async (orderId, phoneNumber) => {
  const updateDriverPhoneQuery = `
    UPDATE orders
    SET driver_phone = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(updateDriverPhoneQuery, [
    phoneNumber,
    orderId,
  ]);
  return result.rows[0]; // Return the updated order
};

const getPricePerMinute = async () => {
  const query = `
    SELECT price_per_minute
    FROM admin_panel
    WHERE id = $1;
  `;
  const result = await pool.query(query, [1]); // Получаем запись с id = 1
  return result.rows[0].price_per_minute; // Возвращаем значение price_per_minute
};

module.exports = {
  createOrder,
  getUserRides,
  getAllRidesModel,
  getOrderById,
  updateOrderStatus,
  updateOrderDriverPhone,
  getPricePerMinute,
  getDriverRides,
};
