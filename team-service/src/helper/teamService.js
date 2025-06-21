const ApiError = require("../errors/ApiError");
const { AddTeamMemberModel } = require("../models/addTeamMember");
const { findTeam } = require("../services/teamServices");
const { dataGathering } = require("../utils/dataGatheringFromServices");
const { enrichedTeams } = require("../utils/enrichTeams");
const { fetchPlayersId } = require("../utils/fetchIds");
const { formateTeamData } = require("../utils/formateData");

// teamService.js
async function getTeamProfileData(teamId) {
    const team = await findTeam(teamId);
    if (!team) throw new ApiError(Lang.TEAM_NOT_FOUND, 404);

    const players = await AddTeamMemberModel.find({ teamId, status: { $lte: 2 } });
    const fetchPlayers = await fetchPlayersId(players);
    const finalResponse = await dataGathering(fetchPlayers);
    const enrichedTeams = await enrichedTeams(players, finalResponse);

    const foundedDate = new Date(team.createdAt).toDateString();
    return formateTeamData(
        team._id, team.teamName, team.games, team.description,
        team.addressOfGround, foundedDate, team.logo, "",
        enrichedTeams, team.joinTeam, team.teamVisibility,
        team.memberVisibility, team.openPositions
    );
}

module.exports = {
    getTeamProfileData
}