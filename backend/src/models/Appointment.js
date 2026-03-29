const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Doctor = require("./Doctor");
const User = require("./User");

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
    defaultValue: "scheduled"
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

Appointment.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

module.exports = Appointment;
