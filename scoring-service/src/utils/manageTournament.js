const manageTournament = async () => {
    const tournamentData = await TournamentModel.findById(id).select('playersParticipations teamsParticipations');
    const existingPlayers = new Set(tournamentData?.playersParticipations?.map(player => player.playerId.toString()));
    const existingTeams = new Set(tournamentData?.teamsParticipations?.map(team => team.teamID.toString()));

    // Fetch both teams from TournamentTeamsModel
    const teamsToAdd = await TournamentTeamsModel.find(
        { tournametId: tournamentId, teamID: { $in: [teamA, teamB] }, status: 1 }
    ).populate("teamID", "teamName createdAt profilePicture");


    // Filter teams that are NOT already in teamsParticipations
    const newTeams = teamsToAdd.filter(team => !existingTeams.has(team.teamID.toString()));

    // Filter out players who are already in playersParticipations
    const newPlayers = [...teamAPlayers, ...teamBPlayers]
        .filter(player => !existingPlayers.has(player.playerId.toString()))
        .map(player => ({
            playerId: player.playerId,
            userName: player.userName,
            teamId: {
                _id: player.teamId._id,  // Store teamId with reference
                teamName: player.teamId.teamName,
                createdAt: player.teamId.createdAt,
                profilePicture: player.teamId.profilePicture
            }
        }));

    const updateData = {};

    if (newPlayers.length > 0) {
        updateData.$addToSet = { playersParticipations: { $each: newPlayers } };
    }

    if (newTeams.length > 0) {
        updateData.$addToSet = { ...updateData.$addToSet, teamsParticipations: { $each: newTeams } };
    }

    if (Object.keys(updateData).length > 0) {
        await TournamentModel.findOneAndUpdate(
            { _id: tournamentId },
            updateData,
            { new: true }
        );
    }
}

module.exports = {
    manageTournament
}