const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    noOfPlayers: {
        type: Number,
        required: true,
        min: 1
    },
    substitute: {
        type: Number,
        default: 0,
        min: 0
    },
    homeGround: {
        type: Boolean,
        default: false
    },
    addressOfGround: {
        type: String,
        trim: true
    },
    pinCode: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: "https://example.com/default-logo.png"
    },
    games: {
        type: String,
        enum: ["cricket", "football", "badminton", "volleyball", "tennis", "basketball"],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    teamMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        role: {
            type: String,
            enum: ["captain", "vice-captain", "player"],
            default: "player"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    members: {
        type: Number,
        default: 0
    },
    joinTeam: {
        type: Boolean,
        default: false
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sessions"
    },
    schedule: Object
}, { timestamps: true });

const TeamModel = mongoose.model("teams", TeamSchema);

module.exports = { TeamModel };
