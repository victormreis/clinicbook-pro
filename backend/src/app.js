const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const authRoutes = require('./routes/authRoutes');

const userRoutes = require("./routes/userRoutes");

const specialtyRoutes = require("./routes/specialtyRoutes");

const doctorRoutes = require("./routes/doctorRoutes");

const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/specialties", specialtyRoutes);

app.use("/api/doctors", doctorRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;