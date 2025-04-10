const grpcClientService = require("../services/grpcClientService")

const dataGathering = async (groups) => {
    try {
        let filteredData = []
        if (groups.user) {
            const userData = await grpcClientService.getUserFromUserService(groups.user)
            filteredData = userData.bulk
        }

        return filteredData
        // if (groups.team) {
        //     const teamData = await grpcClientService.getTeamFromTeamService(groups.team)
        // }
        // if (groups.tournament) {
        //     const tournamentData = await grpcClientService.getTournamentFromTournamentService(groups.tournament)
        // }
        // if (groups.venue) {
        //     const venueData = await grpcClientService.getVenueFromVenueService(groups.venue)
        // }
        // if (groups.score) {
        //     const scoreData = await grpcClientService.getScoreFromScoreService(groups.score)
        // }
    } catch (error) {

    }
}

module.exports = { dataGathering }