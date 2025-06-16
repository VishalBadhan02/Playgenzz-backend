const { mongoose } = require("mongoose");

const UserStatSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    careerStats: {
        type: Object,
        default: {}
    }
},
    { timestamps: true })

const UserStatsModel = mongoose.model("statistics", UserStatSchema);

module.exports = UserStatsModel;s