require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const TournamentRouter = require('./routes/tournament');

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Tournament Service connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Routes
app.use('/tournament', TournamentRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Tournament Service is running on port ${PORT}`);
});
