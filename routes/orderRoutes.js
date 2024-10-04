const express = require("express");
const router = express.Router();
const {
  createNewOrder,
  getUserRidesController,
} = require("../controllers/orderController");

router.post("/", createNewOrder);
router.get("/:phoneNumber", getUserRidesController);

module.exports = router;
