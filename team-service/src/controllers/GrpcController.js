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

        const formatTeam = teamsWithMembers?.map((value) => ({
            id: value?._id,
            name: value?.teamName,
            sport: value?.games,
            user_id: userId,
            members: value?.members,
            upcomingMatches: 1,
            wins: 5,
            losses: 3,
            role: 'Captain',
            imageUrl: value?.logo,
            user_id: userId
        }))

        callback(null, { teams: formatTeam, otherTeamsWithDetails });
    } catch (error) {
        console.log("error fetching teams in grpcController of team service", error)
    }

};

const GetTeamIds = async (call, callback) => {
    try {
        const ids = call.request.teams;
        const teams = await TeamModel.find({ _id: { $in: ids } }).select(["teamName", "profilePicture", "_id", "createdAt"]);
        const formateTeams = teams?.map((team) => ({
            id: team._id,
            name: team.teamName,
            imageUrl: team.profilePicture,
            createdAt: team.createdAt
        }));
        return callback(null, { bulk: formateTeams });
    } catch (error) {
        console.log("error fetching teams in grpcController of team service", error)
        // ✅ Only return INTERNAL if there's an actual server error
        return callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
            details: error.message,
        });
    }
}

module.exports = {
    getTeamByUser,
    GetTeamIds
}