const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { Op } = require("sequelize");

const CONSULTATION_DURATION = 30;
const ACTIVE_STATUSES = ["scheduled", "booked"];
const ADMIN_ALLOWED_STATUSES = ["scheduled", "completed", "cancelled"];

function normalizeTimeString(time) {
  if (typeof time !== "string") {
    return null;
  }

  const trimmedTime = time.trim();

  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(trimmedTime)) {
    return null;
  }

  return trimmedTime.length === 5 ? `${trimmedTime}:00` : trimmedTime;
}

function buildAppointmentDateTime(date, time) {
  const normalizedTime = normalizeTimeString(time);

  if (!normalizedTime || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const dateTime = new Date(`${date}T${normalizedTime}`);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function ensureFutureAppointment(date, time) {
  const appointmentDateTime = buildAppointmentDateTime(date, time);

  if (!appointmentDateTime) {
    return {
      valid: false,
      message: "Appointment date and time must use valid formats"
    };
  }

  if (appointmentDateTime.getTime() <= Date.now()) {
    return {
      valid: false,
      message: "Appointments must be scheduled for a future time"
    };
  }

  return {
    valid: true,
    appointmentDateTime
  };
}

async function checkScheduleConflicts({ doctorId, userId, appointmentDate, appointmentTime, excludeAppointmentId }) {
  const startTime = buildAppointmentDateTime(appointmentDate, appointmentTime);

  if (!startTime) {
    return {
      conflict: true,
      statusCode: 400,
      message: "Appointment date and time must use valid formats"
    };
  }

  const endTime = new Date(startTime.getTime() + CONSULTATION_DURATION * 60000);
  const baseWhere = {
    appointmentDate,
    status: {
      [Op.in]: ACTIVE_STATUSES
    }
  };

  if (excludeAppointmentId) {
    baseWhere.id = {
      [Op.ne]: excludeAppointmentId
    };
  }

  const doctorAppointments = await Appointment.findAll({
    where: {
      ...baseWhere,
      doctorId
    }
  });

  const doctorHasConflict = doctorAppointments.some((appointment) => {
    const existingStart = buildAppointmentDateTime(appointment.appointmentDate, appointment.appointmentTime);
    const existingEnd = new Date(existingStart.getTime() + CONSULTATION_DURATION * 60000);

    return startTime < existingEnd && endTime > existingStart;
  });

  if (doctorHasConflict) {
    return {
      conflict: true,
      statusCode: 400,
      message: "Doctor already has an appointment during this time"
    };
  }

  const userAppointments = await Appointment.findAll({
    where: {
      ...baseWhere,
      userId
    }
  });

  const userHasConflict = userAppointments.some((appointment) => {
    const existingStart = buildAppointmentDateTime(appointment.appointmentDate, appointment.appointmentTime);
    const existingEnd = new Date(existingStart.getTime() + CONSULTATION_DURATION * 60000);

    return startTime < existingEnd && endTime > existingStart;
  });

  if (userHasConflict) {
    return {
      conflict: true,
      statusCode: 400,
      message: "This user already has another appointment during this time"
    };
  }

  return {
    conflict: false
  };
}

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "doctorId, appointmentDate and appointmentTime are required"
      });
    }

    const futureCheck = ensureFutureAppointment(appointmentDate, appointmentTime);

    if (!futureCheck.valid) {
      return res.status(400).json({
        message: futureCheck.message
      });
    }

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    const conflictCheck = await checkScheduleConflicts({
      doctorId,
      userId: req.user.id,
      appointmentDate,
      appointmentTime
    });

    if (conflictCheck.conflict) {
      return res.status(conflictCheck.statusCode).json({
        message: conflictCheck.message
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      userId: req.user.id,
      appointmentDate,
      appointmentTime: normalizeTimeString(appointmentTime),
      status: "scheduled"
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

exports.getAllAppointmentsForAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "email"]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"]
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

exports.adminCancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment already cancelled"
      });
    }

    await appointment.update({
      status: "cancelled"
    });

    res.status(200).json({
      message: "Appointment cancelled successfully by admin"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.adminUpdateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, appointmentDate, appointmentTime, status } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    const nextDoctorId = doctorId ?? appointment.doctorId;
    const nextAppointmentDate = appointmentDate ?? appointment.appointmentDate;
    const nextAppointmentTime = appointmentTime ?? appointment.appointmentTime;
    const normalizedAppointmentTime = normalizeTimeString(nextAppointmentTime);
    const nextStatus = status ?? appointment.status;

    if (!normalizedAppointmentTime) {
      return res.status(400).json({
        message: "Appointment time must use HH:MM format"
      });
    }

    if (!ADMIN_ALLOWED_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        message: "Status must be scheduled, completed or cancelled"
      });
    }

    const doctor = await Doctor.findByPk(nextDoctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    if (nextStatus !== "cancelled") {
      const futureCheck = ensureFutureAppointment(nextAppointmentDate, normalizedAppointmentTime);

      if (!futureCheck.valid) {
        return res.status(400).json({
          message: futureCheck.message
        });
      }

      const conflictCheck = await checkScheduleConflicts({
        doctorId: nextDoctorId,
        userId: appointment.userId,
        appointmentDate: nextAppointmentDate,
        appointmentTime: normalizedAppointmentTime,
        excludeAppointmentId: appointment.id
      });

      if (conflictCheck.conflict) {
        return res.status(conflictCheck.statusCode).json({
          message: conflictCheck.message
        });
      }
    }

    await appointment.update({
      doctorId: nextDoctorId,
      appointmentDate: nextAppointmentDate,
      appointmentTime: normalizedAppointmentTime,
      status: nextStatus
    });

    const refreshedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "email"]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"]
        }
      ]
    });

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: refreshedAppointment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};
