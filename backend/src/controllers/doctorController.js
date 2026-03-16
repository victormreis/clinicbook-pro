const Doctor = require("../models/Doctor");
const Specialty = require("../models/Specialty");

exports.createDoctor = async (req, res) => {
  try {

    const { name, email, specialtyId } = req.body;

    if (!name || !email || !specialtyId) {
      return res.status(400).json({
        message: "Name, email and specialtyId are required"
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    const specialty = await Specialty.findByPk(specialtyId);

    if (!specialty) {
      return res.status(404).json({
        message: "Specialty not found"
      });
    }

    const existingDoctor = await Doctor.findOne({ where: { email } });

    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor with this email already exists"
      });
    }

    const doctor = await Doctor.create({
      name,
      email,
      specialtyId
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};