const express = require("express");
const router = express.Router();
const {
  createNewOrder,
  getUserRidesController,
  getAllRides,
  getOrderController,
  startRideController,
  endRideController,
  cancelOrder,
  getDriverRidesController,
} = require("../controllers/orderController");

// Маршруты для работы с заказами
router.get("/all", getAllRides); // Получить все поездки
router.post("/", createNewOrder); // Создать новый заказ
router.get("/get/:phoneNumber", getUserRidesController); // Получить поездки по номеру телефона
router.get("/dget/:phoneNumber", getDriverRidesController); // Получить поездки по номеру телефона
router.get("/order/:id/:phoneNumber", getOrderController); // Получить заказ по ID
router.get("/cancel/:id", cancelOrder);

// Маршруты для начала и завершения поездки
router.post("/set/:id/start-trip", startRideController); // Начать поездку
router.post("/set/:id/end-trip", endRideController); // Завершить поездку

module.exports = router;
