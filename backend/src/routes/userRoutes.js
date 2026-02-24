const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeAdmin } = require("../middleware/roleMiddleware");

// User routes
router.put("/profile", authenticate, userController.updateProfile);

// Admin routes
router.get("/", authenticate, authorizeAdmin, userController.getAllUsers);
router.patch("/:id/role", authenticate, authorizeAdmin, userController.updateUserRole);
router.delete("/:id", authenticate, authorizeAdmin, userController.deleteUser);

module.exports = router;