require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');

const User = require('./src/models/User');
const Specialty = require("./src/models/Specialty");
const Doctor = require("./src/models/Doctor");

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');

    return sequelize.sync({alter: true});
  })
  .then(() => {
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });