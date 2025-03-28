const { mongoose } = require("mongoose");
const { type } = require("os");

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    profilePicture: String,
    userName: String,
    phoneNumber: Number,
    email: String,
    address: Object,
    password: String,
    team: {
        type: Object,
        ref: "teams"
    },
    userTeams: Array,
    otherTeams: Array,
    status: String,
    friends: Object,
    active: { type: Boolean, default: false },
    lastActiveAt: { type: Date },
}, { timestamps: true })

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;