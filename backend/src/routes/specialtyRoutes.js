const express = require("express");
const router = express.Router();

const specialtyController = require("../controllers/specialtyController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeAdmin } = require("../middleware/roleMiddleware");

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  specialtyController.createSpecialty
);

module.exports = router;