const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctorController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeAdmin } = require("../middleware/roleMiddleware");

router.get(
  "/",
  authenticate,
  doctorController.getAllDoctors
);


/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create a doctor and assign a specialty (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDoctorRequest'
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  doctorController.createDoctor
);



module.exports = router;