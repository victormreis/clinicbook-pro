const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Doctor = require("./Doctor");

const Appointment = sequelize.define("Appointment", {
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "booked"
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Appointment.belongsTo(Doctor, {
  foreignKey: "doctorId",
  as: "doctor"
});

module.exports = Appointment;