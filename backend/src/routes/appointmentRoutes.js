const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

const { authenticate } = require("../middleware/authMiddleware");



/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get logged user's appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user appointments
 */
router.get(
  "/my",
  authenticate,
  appointmentController.getMyAppointments
);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     description: Creates a new appointment for the authenticated user with a specific doctor.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 * 
 *     requestBody:
 *       required: true
 *       description: Appointment information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *           example:
 *             doctorId: 1
 *             appointmentDate: "2024-07-01"
 *             appointmentTime: "14:30"
 * 
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *             example:
 *               id: 1
 *               doctorId: 1
 *               userId: 5
 *               appointmentDate: "2024-07-01"
 *               appointmentTime: "14:30"
 * 
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid appointment data"
 * 
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 * 
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Doctor not found"
 * 
 *       409:
 *         description: Appointment slot already taken
 *         content:
 *           application/json:
 *             example:
 *               message: "This time slot is already booked"
 * 
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  appointmentController.createAppointment
);

module.exports = router;