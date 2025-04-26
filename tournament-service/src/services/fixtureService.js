const tournamentServices = require("./tournamentServices");

const generateFixtures = async (input) => {
    const { tournamentId, fixtures } = input;
    const { tournamentFormat, randomize, allowByes, startDate, matchesPerDay } = fixtures;

    const query = {
        tournametId: tournamentId,
        status: 1,
        paymentStatus: "confirmed",
        matchStatus: "registered"
    };

    const teams = await tournamentServices.getTournamentTeams(query);

    const rematch = teams.filter(team => team.matchStatus === "re-entry");

    if (!teams.length) {
        throw new Error("No teams registered yet!");
    }

    let result = [];
    let roundNumber;

    const roundQuery = {
        tournamentId,
    };

    const round = await tournamentServices.roundModal(roundQuery);
    // console.log("round", round)

    if (!round) {
        roundNumber = 1;
        result = teams.map(({ teamID }) => ({
            id: teamID?._id || "dfkjcn",
            userID: teamID?.user_id || "dfkjcn",
            name: teamID?.teamName || "dfkjcn",
            avatar: teamID?.profilePicture || "dfkjcn"
        }));
        // if (tournamentFormat === "single_elimination") {
        //     await TournamentModel.findByIdAndUpdate(tournamentId, {
        //         $set: {
        //             matches: teams.length - 1,
        //         },
        //     });
        // }
    } else {
        roundNumber = round.roundNumber + 1;

        if (round.winners?.length) {
            result = round.winners.map(teamID => ({
                id: teamID?._id || "dfkjcn",
                userID: teamID?.user_id || "dfkjcn",
                name: teamID?.teamName || "dfkjcn",
                avatar: teamID?.profilePicture || "dfkjcn"
            }));
        }

        if (round.byes?.length) {
            result.push(
                ...round.byes.map(teamID => ({
                    id: teamID?._id || "dfkjcn",
                    userID: teamID?.user_id || "dfkjcn",
                    name: teamID?.teamName || "dfkjcn",
                    avatar: teamID?.profilePicture || "dfkjcn"
                }))
            );
        }

        if (rematch?.length) {
            result.push(
                ...rematch.map(team => ({
                    id: team?.teamID?._id || "dfkjcn",
                    userID: team?.teamID?.user_id || "dfkjcn",
                    name: team?.teamID?.teamName || "dfkjcn",
                    avatar: team?.teamID?.profilePicture || "dfkjcn"
                }))
            );
        }
    }

    if (!result.length) {
        throw new Error("No valid teams found for fixtures");
    }

    // Here you would generate the fixtures and store them
    return { roundNumber, teams: result };
};

module.exports = {
    generateFixtures
};
