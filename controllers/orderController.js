const {
  createOrder,
  getUserRides,
  getAllRidesModel,
  getOrderById,
  updateOrderStatus,
  updateOrderDriverPhone,
  getPricePerMinute,
} = require("../models/orderModel");

// Создать новый заказ
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

// Получить поездки пользователя по номеру телефона
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

// Получить все поездки
const getAllRides = async (req, res) => {
  try {
    const rides = await getAllRidesModel();
    res.status(200).json(rides);
  } catch (error) {
    console.error("Ошибка при получении поездок:", error);
    res.status(500).json({ error: "Ошибка сервера при получении поездок" });
  }
};

// Получить заказ по ID
const getOrderController = async (req, res) => {
  try {
    const { id, phoneNumber } = req.params; // Получаем id и номер телефона из параметров URL

    const order = await getOrderById(id); // Получаем заказ из модели

    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    // Обновляем номер телефона водителя
    await updateOrderDriverPhone(id, phoneNumber); // Используем функцию для обновления номера телефона в БД

    return res.status(200).json(order); // Возвращаем заказ клиенту
  } catch (error) {
    console.error("Ошибка при получении заказа:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Начать поездку
const startRideController = async (req, res) => {
  const { id } = req.params; // Получаем id заказа из параметров URL

  try {
    const currentTime = new Date(); // Получаем текущее время

    // Обновляем статус заказа на "в пути" и устанавливаем время pickup
    const updatedOrder = await updateOrderStatus(id, "ожидает", currentTime);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    return res.status(200).json({
      message: "Поездка начата",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Ошибка при начале поездки:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при начале поездки" });
  }
};

const endRideController = async (req, res) => {
  const { id } = req.params; // Получаем id заказа из параметров URL

  try {
    const completedAt = new Date(); // Устанавливаем время завершения поездки

    // Обновляем статус заказа на "завершен" и устанавливаем время завершения
    const updatedOrder = await updateOrderStatus(
      id,
      "завершен",
      null,
      completedAt
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    // Получаем время pickup и завершения
    const { pickup_time, ending_time } = updatedOrder;

    // Вычисляем разницу во времени в минутах
    const pickupTime = new Date(pickup_time);
    const endingTime = new Date(ending_time);

    const timeDifferenceInMs = endingTime - pickupTime; // разница в миллисекундах
    const timeDifferenceInMinutes = Math.floor(
      timeDifferenceInMs / (1000 * 60)
    ); // разница в минутах

    // Получаем цену за минуту из admin_panel
    const pricePerMinute = await getPricePerMinute();

    // Рассчитываем финальную стоимость поездки
    const totalPrice = pricePerMinute * timeDifferenceInMinutes + 89;

    return res.status(200).json({
      message: "Поездка завершена",
      order: updatedOrder,
      duration: timeDifferenceInMinutes, // возвращаем продолжительность поездки
      price: totalPrice, // возвращаем рассчитанную цену
    });
  } catch (error) {
    console.error("Ошибка при завершении поездки:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при завершении поездки" });
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.params; // Получаем id заказа из параметров URL

  try {
    // Обновляем статус заказа на "отменен"
    const updatedOrder = await updateOrderStatus(id, "отменен");

    // Если заказ не найден
    if (!updatedOrder) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    // Возвращаем успешный ответ с обновленным заказом
    return res.status(200).json({
      message: "Заказ отменен",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Ошибка при отмене заказа:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при отмене заказа" });
  }
};

module.exports = {
  createNewOrder,
  getUserRidesController,
  getAllRides,
  getOrderController,
  startRideController,
  endRideController,
  cancelOrder,
};
