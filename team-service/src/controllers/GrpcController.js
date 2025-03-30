const { TeamModel } = require("../models/team");

const getTeamByUser = async (call, callback) => {
    try {
        const team = await TeamModel.find({ user_id: call.request.userId });
        callback(null, { teams: team });
    } catch (error) {
        console.log("error fetching teams in grpcController of team service")
    }

};

module.exports = {
    getTeamByUser
}