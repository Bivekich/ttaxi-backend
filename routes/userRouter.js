const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  changeStatus,
  addUser,
  changeAdmin,
  getPricePerMinute,
  getUser,
} = require("../controllers/userController");

// Existing routes
router.get("/users", getAllUsers);
router.post("/changestatus", changeStatus);
router.post("/addUser", addUser);
router.get("/profile/:phoneNumber", getUser);

// New route for changing admin settings
router.post("/changeAdmin", changeAdmin); // Add the new route here
router.get("/getPricePerMinute", getPricePerMinute);

module.exports = router;
