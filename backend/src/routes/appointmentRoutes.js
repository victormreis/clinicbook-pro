const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

const { authenticate } = require("../middleware/authMiddleware");



/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get logged user's appointments
 *     description: Returns a list of all appointments that belong to the authenticated user.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   appointmentDate:
 *                     type: string
 *                     example: "2026-03-20"
 *                   appointmentTime:
 *                     type: string
 *                     example: "14:00"
 *                   status:
 *                     type: string
 *                     example: scheduled
 *                   createdAt:
 *                     type: string
 *                     example: "2026-03-15T10:30:00.000Z"
 *                   doctor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: Dr. John Doe
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       500:
 *         description: Internal server error
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


/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   put:
 *     summary: Cancel an appointment
 *     description: Cancels an existing appointment by its ID.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment ID
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment cancelled successfully
 *       400:
 *         description: Appointment already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your appointment
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/cancel",
  authenticate,
  appointmentController.cancelAppointment
);

module.exports = router;