const TournamentTeamsModel = require("../models/TournamentTeams");
const RoundModel = require("../models/Round");
const { TournamentModel } = require("../models/tournament");
// const TournamentModel = require("../models/Tournament");

const generateFixtures = async (input) => {
    const { tournamentId, fixtures } = input;
    const { tournamentFormat, randomize, allowByes, startDate, matchesPerDay } = fixtures;

    const teams = await TournamentTeamsModel.find({ tournamentId, status: 1 }).populate("teamID");
    const rematch = teams.filter(team => team.matchStatus === "re-entry");

    if (!teams.length) {
        throw new Error("No teams registered yet!");
    }

    let result = [];
    let roundNumber;

    const round = await RoundModel.findOne({ tournamentId })
        .populate({ path: "winners byes", select: "teamName avatar _id user_id" })
        .sort({ roundNumber: -1 });

    if (!round) {
        roundNumber = 1;
        result = teams.map(({ teamID }) => ({
            id: teamID._id,
            userID: teamID.user_id,
            name: teamID.teamName,
            avatar: teamID.profilePicture
        }));

        if (tournamentFormat === "single_elimination") {
            await TournamentModel.findByIdAndUpdate(tournamentId, {
                $set: {
                    matches: teams.length - 1
                }
            });
        }

    } else {
        roundNumber = round.roundNumber + 1;

        if (round.winners?.length) {
            result = round.winners.map(teamID => ({
                id: teamID._id,
                userID: teamID.user_id,
                name: teamID.teamName,
                avatar: teamID.profilePicture
            }));
        }

        if (round.byes?.length) {
            result.push(
                ...round.byes.map(teamID => ({
                    id: teamID._id,
                    userID: teamID.user_id,
                    name: teamID.teamName,
                    avatar: teamID.profilePicture
                }))
            );
        }

        if (rematch?.length) {
            result.push(
                ...rematch.map(team => ({
                    id: team.teamID._id,
                    userID: team.teamID.user_id,
                    name: team.teamID.teamName,
                    avatar: team.teamID.profilePicture
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
