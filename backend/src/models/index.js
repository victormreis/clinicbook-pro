const User = require("./User");
const Doctor = require("./Doctor");
const Appointment = require("./Appointment");

User.hasMany(Appointment, {
  foreignKey: "userId",
  as: "appointments"
});

Doctor.hasMany(Appointment, {
  foreignKey: "doctorId",
  as: "appointments"
});

Appointment.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

Appointment.belongsTo(Doctor, {
  foreignKey: "doctorId",
  as: "doctor"
});

module.exports = {
  User,
  Doctor,
  Appointment
};