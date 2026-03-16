const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

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