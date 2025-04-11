export const formatePlayerData = (userId, playerId, userName, teamId, status, commit) => {
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