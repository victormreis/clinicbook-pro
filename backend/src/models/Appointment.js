const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  }
});

module.exports = Appointment;