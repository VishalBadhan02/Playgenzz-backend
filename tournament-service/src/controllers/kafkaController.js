const manageTournament = async (tournamentId, [teamA, teamB], players) => {
    const tournamentData = await TournamentModel.findById(tournamentId)
        .select("playersParticipations teamsParticipations");

    const existingPlayers = new Set(
        tournamentData?.playersParticipations?.map(p => p.playerId.toString())
    );
    const existingTeams = new Set(
        tournamentData?.teamsParticipations?.map(t => t.teamID.toString())
    );

    const teamsToAdd = await TournamentTeamsModel.find({
        tournametId: tournamentId,
        teamID: { $in: [teamA, teamB] },
        status: 1
    }).populate("teamID", "teamName createdAt profilePicture");

    const newTeams = teamsToAdd.filter(t => !existingTeams.has(t.teamID.toString()));

    const newPlayers = players
        .filter(p => !existingPlayers.has(p.playerId.toString()))
        .map(p => ({
            playerId: p.playerId,
            userName: p.userName,
            teamId: {
                _id: p.teamId._id,
                teamName: p.teamId.teamName,
                createdAt: p.teamId.createdAt,
                profilePicture: p.teamId.profilePicture
            }
        }));

    const updateData = {};

    if (newPlayers.length > 0) {
        updateData.$addToSet = { playersParticipations: { $each: newPlayers } };
    }

    if (newTeams.length > 0) {
        updateData.$addToSet = {
            ...updateData.$addToSet,
            teamsParticipations: { $each: newTeams }
        };
    }

    if (Object.keys(updateData).length > 0) {
        await TournamentModel.findOneAndUpdate(
            { _id: tournamentId },
            updateData,
            { new: true }
        );
    }
};

module.exports = { manageTournament };
