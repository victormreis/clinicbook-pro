const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Doctor = sequelize.define("Doctor", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }, 
   consultationDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  }
});

module.exports = Doctor;