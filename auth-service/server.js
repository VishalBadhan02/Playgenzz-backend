require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const AuthRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Auth Service connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Routes
app.use('/auth', AuthRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Auth Service is running on port ${PORT}`);
});
