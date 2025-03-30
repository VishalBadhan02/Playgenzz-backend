const { TeamModel } = require("../models/team");

const getTeamByUser = (call, callback) => {
    const team = TeamModel.find({ user_id: call.request.user_id });
    if (!team) {
        return callback({
            code: grpc.status.NOT_FOUND,
            message: "Team not found"
        });
    }
    callback(null, team);
};

module.exports = {
    getTeamByUser
}