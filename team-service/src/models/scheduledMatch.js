const mongoose = require('mongoose');

const ScheduleSchema = mongoose.Schema({
    matchType: {
        type: String,
        enum: ["friendly", "tournament"],
        required: true
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tournaments",
        required: function () {
            return this.matchType === "tournament";
        }
    },
    roundNumber: {
        type: Number,
        required: function () {
            return this.matchType === "tournament";
        }
    },
    userTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    opponentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams"
    },
    opponentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    dateOfMatch: {
        type: String,
        required: true
    },
    totalMatches: {
        type: Number,
    },
    place_of_match: String,
    ground: String,
    overs: {
        type: Number,
        required: true
    },
    players: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    matchStatus: {
        type: String,
        enum: ["upcoming", "completed", "cancelled", "abandoned", "pending"],
        required: true
    },
    reMatch: Number,
    sessionId: String,
    sportType: {
        type: String,
        required: true,
        enum: ['cricket', 'football', 'basketball', 'volleyball']
    },
    results: {
        type: Object,
        ref: "teams"
    }
}, { timestamps: true });

const ScheduledMatchModel = mongoose.model("scheduled_matches", ScheduleSchema);

module.exports = { ScheduledMatchModel };


