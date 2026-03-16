const Specialty = require("../models/Specialty");

exports.createSpecialty = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Specialty name is required"
      });
    }

    const specialty = await Specialty.create({ name });

    return res.status(201).json({
      message: "Specialty created successfully",
      specialty
    });

  } catch (error) {
    console.error(error);
    
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Specialty already exists"
      });
    }

    return res.status(500).json({
      message: "Server error"
    });
  }
};