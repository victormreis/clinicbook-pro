const express = require("express");
const router = express.Router();

const specialtyController = require("../controllers/specialtyController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeAdmin } = require("../middleware/roleMiddleware");


/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Get list of medical specialties
 *     description: Returns all medical specialties available in the system.
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of specialties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Specialty'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  specialtyController.getAllSpecialties
);

/**
 * @swagger
 * /api/specialties:
 *   post:
 *     summary: Create a new medical specialty (Admin only)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSpecialtyRequest'
 *     responses:
 *       201:
 *         description: Specialty created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  specialtyController.createSpecialty
);

module.exports = router;