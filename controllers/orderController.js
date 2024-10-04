const { createOrder, getUserRides } = require("../models/orderModel");

const createNewOrder = async (req, res) => {
  const {
    phoneNumber,
    status,
    pickupCoordinates,
    destinationCoordinates,
    pickupAddress,
    destinationAddress,
    yandexRouteLink,
    price,
  } = req.body;

  const createdAt = new Date();
  const completedAt = null;

  try {
    const newOrder = await createOrder({
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
    });

    res.status(200).json({
      message: "Заказ успешно создан",
      order: newOrder,
    });
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    res.status(500).json({ error: "Ошибка сервера при создании заказа" });
  }
};

const getUserRidesController = async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const rides = await getUserRides(phoneNumber);
    res.status(200).json(rides);
  } catch (error) {
    console.error("Ошибка при получении поездок:", error);
    res.status(500).json({ error: "Ошибка сервера при получении поездок" });
  }
};

module.exports = {
  createNewOrder,
  getUserRidesController,
};
