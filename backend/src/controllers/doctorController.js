const Doctor = require("../models/Doctor");
const Specialty = require("../models/Specialty");
const Appointment = require("../models/Appointment");
const { Op } = require("sequelize");

const CONSULTATION_DURATION = 30;


exports.createDoctor = async (req, res) => {
	try {
		const { name, email, specialtyId, CONSULTATION_DURATION } = req.body;

		if (!name || !email || !specialtyId) {
			return res.status(400).json({
				message: "Name, email and specialtyId are required",
			});
		}

		const emailRegex = /\S+@\S+\.\S+/;

		if (!emailRegex.test(email)) {
			return res.status(400).json({
				message: "Invalid email format",
			});
		}

		const specialty = await Specialty.findByPk(specialtyId);

		if (!specialty) {
			return res.status(404).json({
				message: "Specialty not found",
			});
		}

		const existingDoctor = await Doctor.findOne({ where: { email } });

		if (existingDoctor) {
			return res.status(400).json({
				message: "Doctor with this email already exists",
			});
		}

		const doctor = await Doctor.create({
			name,
			email,
			specialtyId,
			CONSULTATION_DURATION,
		});

		res.status(201).json({
			message: "Doctor created successfully",
			doctor,
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Server error",
		});
	}
};

exports.getAllDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.findAll({
			attributes: ["id", "name", "email"],
			include: {
				model: Specialty,
				as: "specialty",
				attributes: ["id", "name"],
			},
		});

		res.status(200).json(doctors);
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Server error",
		});
	}
};

exports.getDoctorsBySpecialty = async (req, res) => {
	try {
		const { specialtyId } = req.params;

		const doctors = await Doctor.findAll({
			where: { specialtyId },
		});

		res.status(200).json(doctors);
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Server error",
		});
	}
};

exports.updateDoctor = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, email, specialtyId, CONSULTATION_DURATION } = req.body;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    await doctor.update({
      name,
      email,
      specialtyId,
      CONSULTATION_DURATION
    });

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.deleteDoctor = async (req, res) => {
  try {

    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    await doctor.destroy();

    res.status(200).json({
      message: "Doctor deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.getAvailableTimes = async (req, res) => {
  try {

    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "date query parameter is required"
      });
    }

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

  

    // Clinic working hours
    const startHour = 9;
    const endHour = 17;

    const availableTimes = [];

    let currentTime = new Date(`${date}T09:00`);
    const endTimeLimit = new Date(`${date}T17:00`);

    // Generate all possible times
    while (currentTime < endTimeLimit) {

      const timeString = currentTime.toTimeString().slice(0,5);

      availableTimes.push(timeString);

      currentTime = new Date(
        currentTime.getTime() + CONSULTATION_DURATION * 60000
      );

    }

    // Get appointments already booked
    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: date,
        status: {
          [Op.in]: ["scheduled", "booked"]
        }
      }
    });

    const bookedTimes = appointments.map(app =>
      app.appointmentTime.slice(0,5)
    );

    // Remove booked times
    const freeTimes = availableTimes.filter(
      time => !bookedTimes.includes(time)
    );

    res.status(200).json(freeTimes);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};
