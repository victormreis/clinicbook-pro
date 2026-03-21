const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Specialty = sequelize.define("Specialty", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

const Doctor = require("./Doctor");

Specialty.hasMany(Doctor, {
  foreignKey: "specialtyId",
  as: "doctors"
});

Doctor.belongsTo(Specialty, {
  foreignKey: "specialtyId",
  as: "specialty"
});

module.exports = Specialty;