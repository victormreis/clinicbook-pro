const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

router.put("/profile", authenticate, userController.updateProfile);

module.exports = router;