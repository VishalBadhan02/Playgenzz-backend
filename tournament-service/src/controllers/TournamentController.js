// const { TeamModel } = require("../models/team")
const TournamentTeamsModel = require("../models/tournamentEntry")
const reply = require('../helper/reply');
const { TournamentModel } = require("../models/tournament")
const lang = require('../language/en');
// const UserModel = require("../models/user");
// const { knownExtended, c, r } = require("tar");
// const { mongo } = require("mongoose");
// const TournamentController = require("../helper/tournamnetFixture");
const { RoundModel } = require("../models/tournamentRounds");
// const { ScoreCardModel } = require("../models/socreCard");
// const { AddTeamMemberModel } = require("../models/addTeamMember");
const bcrypt = require('bcryptjs');
const tournamentServices = require("../services/tournamentServices");

const handleRegister = async (req, res) => {
    try {
        const { name, admin, password, ...otherTournamentData } = req.body; // Destructure request body
        console.log(req.body)
        if (name) {
            const existingTournament = await TournamentModel.findOne({ name });
            if (existingTournament) {
                return res.json(reply.failure("Change the name of the tournament, it already exists"));
            }
        }

        const headAdmin = req.user._id;
        const adminList = Array.isArray(admin) ? admin : [];
        adminList.push(headAdmin);

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new tournament document with the provided data
        const newTournament = new TournamentModel({
            ...otherTournamentData,
            name,
            admin: adminList,
            headAdmin,
            winner: null,
            isVerified: false,
            password: hashedPassword,
        });

        // Save to MongoDB
        await newTournament.save();

        return res.status(201).json(reply.success("Tournament registered successfully! Verification pending", newTournament));
    } catch (error) {
        console.error("Error registering tournament:", error);
        return res.status(500).json({ success: false, message: "Failed to register tournament", error: error.message });
    }
};

const fetchtournament = async (req, res) => {
    try {
        const tournament = await TournamentModel.find().sort({ rank: "asc" })

        const formateTournament = tournament?.map(value => ({
            id: value?._id,
            name: value?.name,
            startDate: value?.start_date,
            endDate: value?.end_date,
            location: value?.address,
            teams: 0,
            maxTeams: value?.totalTeams,
            registrationOpen: true,
            imageUrl: 'https://via.placeholder.com/400x200'
        }))

        return res.json(reply.success("Tournament fetched successfully", formateTournament))
    } catch (err) {
        res.send(err.message)
    }
}

const setEntry = async (req, res) => {
    try {
        const { id } = req.body;  // Extract tournament ID from request body
        const user = req.user._id;

        const tournament = await TournamentModel.findOne({ _id: id });
        if (!tournament) {
            console.log("not found")
            return res.status(404).json(reply.failure(lang.TOURNAMENT_NOT_FOUND));
        }

        // const team = await TeamModel.findOne({ user_id: user, games: tournament.sport });
        // if (!team) {
        //     console.log(" team not found")
        //     return res.status(404).json(reply.failure(lang.TEAM_NOT_FOUND));
        // }

        // const entry = new TournamentTeamsModel({
        //     tournametId: id,
        //     teamID: team._id,
        //     teamName: team.teamName,
        //     status: 0,
        //     paymentStatus: "pending"
        // });

        // await entry.save();

        return res.status(200).json(reply.success(lang.TOURNAMENT_TEAM_REGISTERATION));
    } catch (error) {
        console.error("Error in setEntry:", error);  // Logs error in server
        return res.status(500).json({ message: "Entry not done", error: error.message });
    }
};

const getTournaments = async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const userId = req.user._id;
        // Find tournament and validate
        const tournament = await TournamentModel.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json(reply.failure(lang.TOURNAMENT_NOT_FOUND));
        }

        // Find user's team for this game type
        let hasRegistered = false;
        // const userTeam = await TeamModel.findOne({
        //     user_id: userId,
        //     games: tournament.sport
        // });

        // If user has a team, check if they're registered for tournament
        // if (userTeam) {
        //     const tournamentRegistration = await TournamentTeamsModel.findOne({
        //         teamID: userTeam._id,
        //         tournametId: tournamentId
        //     });
        //     hasRegistered = !!tournamentRegistration;
        // }

        // Add registration status to tournament object
        const tournamentResponse = {
            ...tournament.toObject(),
            teamId: hasRegistered
        };
        // console.log(tournamentResponse)
        return res.status(200).json(reply.success(
            lang.TOURNAMENT_FETCHED,
            tournamentResponse
        ));

    } catch (err) {
        console.error('Error in getTournaments:', err);
        return res.status(500).json(reply.failure(
            lang.INTERNAL_SERVER_ERROR,
            { error: err.message }
        ));
    }
};

const setTeam = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await TournamentTeamsModel.find({ tournametId: id }).populate("teamID")
        const tournament = await TournamentModel.findOne({ _id: id }).populate("winner")
        const rounds = await RoundModel.findOne({ tournamentId: id }).populate("winners looser").sort({ createdAt: -1 });

        if (!tournament) {
            return res.json(reply.failure("Tournament not found!"))
        }

        // for (const element of data) {
        //     const teamMembers = await AddTeamMemberModel.find({ teamId: element.teamID._id, status: 1 });
        //     element.teamID.teamMembers = teamMembers;
        // }
        return res.json(reply.success("Players Fetched", { data, rounds, tournament, sessionId: req.user._id }))
    } catch (error) {
        return res.json("error in getting tournament teams", error)
    }
}

const getSelectedRound = async (req, res) => {
    try {
        const id = req.params.id;
        const rounds = await RoundModel.find({ tournamentId: id }).populate("winners byes")
            .populate("looser");;

        if (!rounds) {
            return res.json(reply.failure("Rounds fetched"));
        }

        // await Promise.all(
        //     rounds.map(async (round) => {
        //         await Promise.all(
        //             round.matches.map(async (match) => {
        //                 const scoreCard = await ScoreCardModel.findOne({ matchId: match.id });
        //                 match.scoreCard = scoreCard || null;
        //             })
        //         );
        //     })
        // );
        return res.json(reply.success("Start making fixtures now", rounds));
    } catch (error) {
        return res.json(reply.failure("Error in fetching rounds", error));
    }
};

const UpdateWinner = async (req, res) => {
    try {
        const { id, winner, round, name } = req.body;
        const update = await TournamentFixturesModel.findOneAndUpdate(
            { tournament_id: id, round: round },
            { $push: { winner: { id: winner, name: name } } },
            { new: true }
        );

        if (update) {
            return res.json({ success: true, data: update });
        } else {
            return res.json({ success: false, message: "Tournament not found" });
        }
    } catch (error) {
        return res.json({ success: false, message: "Error in UpdateWinner" });
    }
};

const setFixtures = async (req, res) => {
    try {
        const { id, type, settings, save, date } = req.body;
        const withByes = settings.withByes;
        const randomize = settings.randomize;
        let result = [];

        const teams = await TournamentTeamsModel.find({ tournametId: id, status: 1 }).populate("teamID");
        const rematch = teams.filter(value => value.matchStatus === "re-entry")

        if (teams.length === 0) {
            return res.json(reply.failure("No team registered yet !"))
        }

        let round = await RoundModel.findOne({ tournamentId: id })
            .populate({
                path: "winners byes",
                select: "teamName avatar _id user_id"
            })
            .sort({ roundNumber: -1 });


        if (!round) {
            roundNumber = 1;

            result = teams.map(({ teamID }) => ({
                id: teamID._id,
                userID: teamID.user_id,
                name: teamID.teamName,
                avatar: teamID.profilePicture
            }));
            if (type === "single_elimination")
                await TournamentModel.findOneAndUpdate({ _id: id }, {
                    $set: {
                        matches: teams.length - 1
                    }
                })

        } else {
            roundNumber = round.roundNumber + 1;
            if (round.winners || round.byes || rematch) {
                if (round.winners.length > 0) {
                    result = round.winners.map((teamID) => ({
                        id: teamID._id,
                        userID: teamID.user_id,
                        name: teamID.teamName,
                        avatar: teamID.profilePicture
                    }));
                }

                if (round.byes && round.byes.length > 0) {
                    result = result.concat(round.byes.map((teamID) => ({
                        id: teamID._id,
                        userID: teamID.user_id,
                        name: teamID.teamName,
                        avatar: teamID.profilePicture
                    })));
                }
                if (rematch) {
                    result = result.concat(rematch.map((teamID) => ({
                        id: teamID.teamID._id,
                        userID: teamID.teamID.user_id,
                        name: teamID.teamID.teamName,
                        avatar: teamID.teamID.profilePicture
                    })));
                }
            }
        }

        if (!result) {
            return res.json(reply.failure("No teams Found for fixtures"))
        }

        // const tournamentController = new TournamentController(id, type, roundNumber, result, res, withByes, randomize, date, save);
        // await tournamentController._generateFixtures();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json(reply.failure(error.message));
    }
};

const login = async (req, res) => {
    try {
        const { _id, password } = req.body;

        if (!_id || !password) {
            return res.status(400).json(reply.failure("Missing _id or password"));
        }

        const tournament = await tournamentServices.findTournament(_id);

        if (!tournament) {
            return res.status(404).json(reply.failure(lang.TOURNAMENT_NOT_FOUND));
        }

        const isMatch = await bcrypt.compare(password, tournament.password);

        if (!isMatch) {
            return res.status(401).json(reply.failure(lang.PASSWORD_NOTFOUND));
        }

        return res.status(200).json(
            reply.success(lang.TOURNAMENT_FETCHED, {
                id: tournament._id,
            })
        );
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json(reply.failure("Server error during tournament login"));
    }
};

const deleteTeam = async (req, res) => {
    try {
        const id = req.body.id
        const deleteTeam = await TournamentTeamsModel.findOneAndDelete({ teamID: id })
        return res.json(reply.success(lang.TEAM_DELETED))
    } catch (error) {
        return res.json(reply.failure("fail deleting"))
    }
}

const updatePayment = async (req, res) => {
    try {
        const { teamID, type } = req.body;

        let query = { teamID };
        let update = {};
        let message
        console.log(req.body)
        if (type === "payment") {
            update = {
                $set: {
                    status: 1,
                    paymentStatus: "completed"
                }
            };
            message = "Payment completed successfully"
        }
        else if (type === "disqualified") {
            update = {
                $set: {
                    status: 0,
                    matchStatus: "disqualified"
                }
            };
            message = "Team Diqualified !"

        } else if (type === "re-entry") {
            update = {
                $set: {
                    status: 1,
                    matchStatus: "re-entry"
                }
            };
            message = "Team has been promoted to the next round !"

        }

        const resu = await TournamentTeamsModel.findOneAndUpdate(query, update, { new: true });
        if (!resu) {
            return res.json(reply.failure("Team not found"))
        }

        return res.json(reply.success(message))
    } catch (error) {
        return res.json(reply.failure("Error Updating payment"))
    }
}

const getUserRegisteredTournament = async (req, res) => {
    try {
        const usrerId = req.user._id
        const bookings = await tournamentServices.fetchUserRegisteredTournaments(usrerId)
        return res.status(200).json(reply.success("", bookings))
    } catch (error) {
        console.log("error fetching usertournament", error);
        return res.status(500).json(reply.failure("Error fetching usertournament"));
    }
}




module.exports = {
    setEntry, setTeam, setFixtures, UpdateWinner, getSelectedRound, login, deleteTeam, getTournaments, updatePayment, handleRegister, fetchtournament,
    getUserRegisteredTournament
}
