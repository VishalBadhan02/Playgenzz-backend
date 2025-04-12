const formatePlayerData = (userId, playerId, userName, teamId, status, commit) => {
    const data = {
        userId,
        playerId,
        userName,
        teamId,
        status,
        commit
    }
    return data
}

const formateTeamData = (
    id,
    name,
    sport,
    description,
    location,
    foundedDate,
    logo,
    coverImage,
    members,
    openPositions,
    contactEmail,
    wins,
    losses,
    upcomingMatches,) => {
    const data = {
        id,
        name,
        sport,
        description,
        location,
        foundedDate,
        logo,
        coverImage,
        members,
        openPositions,
        contactEmail,
        wins,
        losses,
        upcomingMatches,
    }
    return data
}

module.exports = {
    formatePlayerData, formateTeamData
}