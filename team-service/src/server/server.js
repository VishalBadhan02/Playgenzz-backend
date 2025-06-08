require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const TeamRouter = require('../routes/team');
const verifyJWT = require('../middleware/JWT');
const Config = require('../config');

const app = express();
const PORT = Config.PORT
const HOST = Config.HOST

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DATABASE_URL)

// MongoDB Connection
mongoose.connect(Config.DATABASE.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Team Service connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Routes
app.use('/team', verifyJWT, TeamRouter);

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Team Service is running on port ${PORT}`);
});
