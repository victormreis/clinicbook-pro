const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { Op } = require("sequelize");

const CONSULTATION_DURATION = 30;

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "doctorId, appointmentDate and appointmentTime are required"
      });
    }

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    // Convert times to Date objects
    const startTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const endTime = new Date(startTime.getTime() + CONSULTATION_DURATION * 60000);

    // 1) Check if USER already has appointment at same time
    const userConflict = await Appointment.findOne({
      where: {
        userId: req.user.id,
        appointmentDate,
        appointmentTime
      }
    });

    if (userConflict) {
      return res.status(400).json({
        message: "You already have an appointment at this time"
      });
    }

    // 2) Check if DOCTOR has conflicting appointment
    const doctorAppointments = await Appointment.findAll({
      where: { doctorId, appointmentDate }
    });

    const doctorHasConflict = doctorAppointments.some(app => {
      const appStart = new Date(`${app.appointmentDate}T${app.appointmentTime}`);
      const appEnd = new Date(appStart.getTime() + CONSULTATION_DURATION * 60000);

      return startTime < appEnd && endTime > appStart;
    });

    if (doctorHasConflict) {
      return res.status(400).json({
        message: "Doctor already has an appointment during this time"
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      userId: req.user.id,
      appointmentDate,
      appointmentTime
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name"]
        }
      ],
      order: [
        ["appointmentDate", "ASC"],
        ["appointmentTime", "ASC"]
      ]
    });

    res.status(200).json(appointments);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};


exports.cancelAppointment = async (req, res) => {
  try {

    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    // 1. Check if exists
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // 2. Check ownership
    if (appointment.userId !== req.user.id) {
      return res.status(403).json({
        message: "You can only cancel your own appointments"
      });
    }

    // 3. Check if already cancelled
    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment already cancelled"
      });
    }

    // 4. Update status
    await appointment.update({
      status: "cancelled"
    });

    res.status(200).json({
      message: "Appointment cancelled successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};