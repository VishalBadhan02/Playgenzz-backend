require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const TeamRouter = require('./routes/team');
const verifyJWT = require('./middleware/JWT');

const app = express();
const PORT = process.env.PORT || 4006;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DATABASE_URL)

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Team Service connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Routes
app.use('/team', verifyJWT, TeamRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Team Service is running on port ${PORT}`);
});
