const mongoose = require('mongoose');

const MATCH_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const RoundSchema = mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tournaments",
        required: true
    },
    tournamentType: {
        type: String,
        required: true
    },
    matches: Array,
    byes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams"
    }],
    winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams"
    }],
    looser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams"
    }],
    reMatch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams"
    }],
    status: {
        type: String,
        enum: Object.values(MATCH_STATUS),
        default: MATCH_STATUS.PENDING
    },
    roundNumber: Number, // Round 1, 2, 3, etc.
}, { timestamps: true });

const RoundModel = mongoose.model("rounds", RoundSchema);

module.exports = { RoundModel };
