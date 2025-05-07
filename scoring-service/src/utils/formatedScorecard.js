const formatedMatches = (
    id,
    match,
    teamAPlayers,
    teamA,
    sportType,
    tournamentId,
    teamB,
    teamBPlayers,
    currentTime,
    total_over,
    players,
) => {
    return scoreCard = {
        matchId: id,
        sportType: sportType,
        scheduledMatch: match,
        tournamentId,
        // Teams Information
        teams: {
            teamA: {
                teamId: teamA,
                score: 0,
                wickets: 0,
                players: teamAPlayers.map(player => ({
                    _id: player._id,
                    playerId: player.playerId,
                    userName: player.userName,
                    statistics: new Map()
                }))
            },
            teamB: {
                teamId: teamB,
                score: 0,
                wickets: 0,
                players: teamBPlayers.map(player => ({
                    _id: player._id,
                    playerId: player.playerId,
                    userName: player.userName,
                    statistics: new Map()
                }))
            }
        },

        // Match Status
        matchStatus: 'scheduled',

        // Current Period/Inning
        currentPeriod: {
            periodNumber: 1,
            periodType: sportType === 'cricket' ? 'inning' : 'half',
            startTime: currentTime
        },

        // Sport Specific Details
        sportSpecificDetails: new Map(
            sportType === 'cricket'
                ? [
                    ['tossWinner', 'pending'],
                    ['currentInning', 1],
                    ['totalOvers', total_over],
                    ['currentOver', 0],
                    ['striker', null],
                    ['nonStriker', null],
                    ['currentBowler', null],
                    ['players', players],
                ]
                : sportType === 'football'
                    ? [
                        ['currentHalf', 1],
                        ['timeElapsed', '00:00'],
                        ['possession', { teamA: 50, teamB: 50 }],
                        ['corners', { teamA: 0, teamB: 0 }],
                        ['fouls', { teamA: 0, teamB: 0 }]
                    ]
                    : []
        ),

        // Initialize empty match statistics
        matchStatistics: new Map()
    };
}


module.exports = { formatedMatches };