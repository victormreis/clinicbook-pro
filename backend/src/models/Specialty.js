const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Specialty = sequelize.define("Specialty", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Specialty;