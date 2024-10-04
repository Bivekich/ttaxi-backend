const pool = require("../config/db");

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

const getUserRides = async (phoneNumber) => {
  const selectRidesQuery = `
    SELECT * FROM orders WHERE phone_number = $1 ORDER BY created_at DESC;
  `;
  const result = await pool.query(selectRidesQuery, [phoneNumber]);
  return result.rows;
};

module.exports = {
  createOrder,
  getUserRides,
};
