const { TeamModel } = require("../models/team");
const { AddTeamMemberModel } = require("../models/addTeamMember");

const getTeamByUser = async (call, callback) => {
    try {
        const userId = call.request.userId

        //fetch all the teams which are registered by the user
        const team = await TeamModel.find({ user_id: userId });

        // Extract teamIds from the user's teams
        const teamIds = team.map(team => team._id);

        // Find other teams where the user is a member, excluding their own teams
        const filteredTeams = await AddTeamMemberModel.find({
            teamId: { $nin: teamIds },
            playerId: userId
        });


        // Fetch data for teams where the user is a member but not the owner
        const otherTeamsWithDetails = await Promise.all(filteredTeams.map(async (teamO) => {
            const teamData = await TeamModel.findOne({ _id: teamO.teamId });
            const membersCount = await AddTeamMemberModel.countDocuments({ teamId: teamO.teamId });
            return { ...teamData, status: teamO.status, members: membersCount };
        }));

        // Fetch team members count for each team in parallel
        const teamsWithMembers = await Promise.all(team.map(async (team) => {
            const membersCount = await AddTeamMemberModel.countDocuments({ teamId: team._id });
            return { ...team.toObject(), members: membersCount };
        }));

        callback(null, { teams: teamsWithMembers, otherTeamsWithDetails });
    } catch (error) {
        console.log("error fetching teams in grpcController of team service", error)
    }

};

module.exports = {
    getTeamByUser
}