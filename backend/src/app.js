const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.use("/api/users", userRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;