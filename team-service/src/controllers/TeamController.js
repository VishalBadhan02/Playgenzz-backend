const reply = require('../helper/reply');
const Lang = require('../language/en');
const { TeamModel } = require('../models/team');
const { ScheduledMatchModel } = require('../models/scheduledMatch');
const { AddTeamMemberModel } = require('../models/addTeamMember');
const teamServices = require('../services/teamServices');
const { formatePlayerData, formateTeamData } = require('../utils/formateData');
const { fetchPlayersId } = require('../utils/fetchIds');
const { dataGathering } = require('../utils/dataGatheringFromServices');
const { enrichedTeams } = require('../utils/enrichTeams');
const { getTeamManagement, storeTeamManagement } = require('../services/redisService');

const registerTeam = async (req, res) => {
    try {
        const formData = req.body;
        const userId = req.user._id;

        //  checking whether the user already registered in the team with existing game
        const existingteamcheck = await teamServices.checkGameExisting(userId, formData.games)

        if (!existingteamcheck) {
            return res.status(402).json(reply.failure(Lang.TEAM_EXIST));
        }

        //check unique name of the team if not unique then return 
        const unique = await teamServices.checkUniqueName(formData?.teamName)

        if (!unique) {
            return res.status(409).json(reply.failure(Lang.UNIQUE_TEAM_NAME));
        }

        //service to register team in database
        const team = await teamServices.handleTeamRegisteation(formData, req.user._id)

        if (!team) {
            return res.status(402).json(reply.failure(team?.message));
        }

        // formating the data to pass in addPlayerInPlayerModal
        const playerdata = await formatePlayerData(userId, userId, req.user?.userName, team._id, 1, "Captain")

        // here user is assinged as a captain for the registered room 
        const player = await teamServices.addPlayerInPlayerModal(playerdata)

        if (!player) {
            return res.status(402).json(reply.failure(team?.message));
        }

        return res.status(201).json(reply.success(Lang.REGISTER_SUCCESS, team._id))

    } catch (err) {
        return res.status(402).json({ error: err.message });
    }
}

const addFriend = async (req, res) => {
    try {
        const _id = req.user._id;
        const { playerId, userName, teamId, type, teamName } = req.body;

        // const team = await TeamModel.findOne({ teamName });
        const addplayer = new AddTeamMemberModel({
            userId: _id,
            playerId,
            userName,
            teamId,
            status: 1,
            commit: "Player"
        });

        const notif = new NotificationModel({
            type_id: addplayer._id,
            user_id: playerId,
            type: "request",
            message: `${teamName} added you in team `,
            status: 1,
        })
        notif.save()
        addplayer.save()
        return res.json(reply.success(Lang.SUCCESS))
    } catch (err) {
        return res.json(err)
    }
}

const getTeam = async (req, res) => {
    try {
        const { team_A, team_B } = req.params;
        const b = [team_A, team_B];

        const teams = await Promise.all(b.map(teamId => TeamModel.findOne({ _id: teamId }).populate({
            path: 'teamMembers.player_id',
        })))

        if (!teams) {
            return res.json(reply.failure("teams not found"))
        }
        return res.json(reply.success(Lang.TOURNAMENT_FETCHED, teams))

    } catch (error) {
        return res.json(reply.failure("error getting teams"))
    }
}

const manageScore = async (req, res) => {
    try {
        // const { e } = req.body
        // if (e <= 6 || ["Wide", "No Ball", "Byes", "Leg Byes"].includes(e)) {
        //     ScoreHandler.setRuns(req.body)
        // }
        // if (e === "Undo" || e === "Out") {
        //     ScoreHandler.setUndoOut(req.body)
        // }
        // return res.json(reply.success())
    } catch (error) {
        return res.status(400).json("error managing score", error)
    }
}

const getTeamProfile = async (req, res) => {
    const _id = req.params._id;
    const cacheKey = `teamProfile:${_id}`;

    try {
        // Step 1: Check cache
        const cachedData = await getTeamManagement(cacheKey);
        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            return res.status(200).json(reply.success(Lang.TEAM_FOUND, parsedData));
        }

        const team = await TeamModel.findOne({ _id })

        const foundedDate = new Date(team?.createdAt).toDateString()

        const players = await AddTeamMemberModel.find({ teamId: _id });

        const fetchPlayers = await fetchPlayersId(players)

        const finalResponse = await dataGathering(fetchPlayers)

        const enrichedTeamsData = await enrichedTeams(players, finalResponse)

        if (!team) {
            return res.status(404).json(reply.failure(Lang.TEAM_NOT_FETCHED));
        }

        const teamData = await formateTeamData(team?._id, team?.teamName, team?.game, team?.description, team?.addressOfGround, foundedDate, team?.logo, "", enrichedTeamsData)

        // Step 3: Store in Redis
        await storeTeamManagement(cacheKey, teamData);

        return res.status(200).json(reply.success(Lang.TEAM_FOUND, teamData));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching team profile", error });
    }
};



const handleMatchRequest = async (req, res) => {
    const { challengeDateTime, type, players, overs, ground, game, _id } = req.body;
    let teamId = req.body.teamId;
    // console.log(req.body)
    // try {
    //     // Fetch the user's team
    //     const userTeam = await UserModel.findOne({ _id: req.user._id });
    //     if (!userTeam) {
    //         return res.status(404).json({ error: "User team not found" });
    //     }

    //     // Fetch the opponent team
    //     const opponentTeam = await TeamModel.findOne({ _id: teamId });
    //     let match;
    //     let typeOf = type === "joinRequest" ? "request" : "match";
    //     let message;

    //     if (!opponentTeam) {
    //         if (type === "reMatch") {

    //             match = await ScheduledMatchModel.findOne({ _id });
    //             const team = match.userId == req.user._id ? match.opponentId : match.userTeamId
    //             const teamName = await TeamModel.findOne({ _id: team, games: game });
    //             teamId = teamName._id;
    //             if (!match) {
    //                 return res.status(404).json({ error: "Match not found" });
    //             }

    //             // Update match properties
    //             match.status = 0;
    //             match.dateOfMatch = challengeDateTime;
    //             match.players = players;
    //             match.overs = overs;
    //             match.ground = ground;
    //             match.reMatch = 1;
    //             match.totalMatches += 1;

    //             message = {
    //                 timing: challengeDateTime,
    //                 teamName: teamName.teamName,
    //                 ground,
    //                 players,
    //                 type: "reMatch"
    //             };
    //             typeOf = "match";
    //         } else {
    //             return res.status(404).json({ error: "Opponent team not found" });
    //         }
    //     }

    //     if (type === "joinRequest") {
    //         match = new AddTeamMemberModel({
    //             userId: opponentTeam.user_id, // Corrected userId assignment
    //             playerId: req.user._id,
    //             userName: userTeam.userName,
    //             status: 0,
    //             commit: "Player",
    //             teamId,
    //         });

    //         message = {
    //             name: userTeam.userName,
    //             type: "joinTeamRequest",
    //             teamName: opponentTeam.teamName,
    //         };
    //     } else if (type === "match") {
    //         match = new ScheduledMatchModel({
    //             matchType: "friendly",
    //             userTeamId: userTeam.team.team_Id,
    //             userId: req.user._id,
    //             opponentId: teamId,
    //             dateOfMatch: challengeDateTime,
    //             opponentUserId: opponentTeam.user_id,
    //             players,
    //             overs,
    //             ground,
    //             status: 0,
    //             matchStatus: "upcoming",
    //             totalMatches: 1,
    //             sportType: game,
    //         });

    //         message = {
    //             timing: challengeDateTime,
    //             teamName: userTeam.team.team_name,
    //             ground,
    //             players,
    //         };
    //     }

    //     // Find the captain of the opponent team
    //     const captain = await AddTeamMemberModel.findOne({ teamId, commit: "Captain" });
    //     if (!captain) {
    //         return res.json(reply.failure("Captain not found in opponent team"));
    //     }

    //     // Create a notification
    //     // const notification = new NotificationModel({
    //     //     type_id: match._id,
    //     //     user_id: captain.playerId,
    //     //     type: typeOf,
    //     //     message,
    //     //     status: 0,
    //     // });

    //     // Save match and notification
    //     await match.save();

    //     await notification.save();

    //     return res.status(200).json(reply.success("Match request processed successfully"));
    // } catch (error) {
    //     return res.status(500).json({ error: "Error processing match request", details: error.message });
    // }
};


const getTeams = async (req, res) => {
    try {
        const { game } = req.params; // Get the game parameter from URL
        const searchTerm = req.query.q || ''; // Get the search query, default to an empty string
        const session_id = req.user._id; // Current user ID

        // Fetch the user's teams
        const userTeams = await TeamModel.find({ user_id: session_id }, '_id');
        const excludedTeamIds = userTeams.map((team) => team._id);

        // Build the dynamic query for teams
        const query = {
            _id: { $nin: excludedTeamIds }, // Exclude user's teams
        };

        if (game) {
            query.games = game;
        }

        if (searchTerm) {
            query.teamName = { $regex: `^${searchTerm}`, $options: 'i' }; // Case-insensitive search
        }

        // Fetch the teams based on the query
        const teams = await TeamModel.find(query)

        // Fetch scheduled matches involving user's teams
        const scheduledMatches = await ScheduledMatchModel.find({
            $or: [
                { userTeamId: { $in: excludedTeamIds } },
                { opponentId: { $in: excludedTeamIds } }
            ]
        });

        // Create a map for scheduled matches
        const matchMap = {};
        scheduledMatches.forEach((match) => {
            const key = match.userId === session_id ? match.opponentId : match.userTeamId;
            matchMap[key] = match;

        });

        // Add scheduled match data to the teams
        const teamsWithSchedules = teams.map((team) => ({
            ...team.toObject(),
            schedule: matchMap[team._id] || null // Add scheduled match data if available
        }));

        // Fetch team members and count for each team
        const teamsWithMembers = await Promise.all(
            teamsWithSchedules.map(async (team) => {
                const members = await AddTeamMemberModel.find({ teamId: team._id, status: 1 });
                return {
                    ...team,
                    teamMembers: members,
                    members: members.length,
                };
            })
        );

        // Send the response
        return res.json(reply.success(Lang.TEAM_FETCH, teamsWithMembers));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};



// const getTeams = async (req, res) => {
//     try {
//         const { game } = req.params; // Get the game parameter from URL
//         const searchTerm = req.query.q || ''; // Get the search query, default to an empty string

//         // Fetch the user's teams to exclude their IDs
//         const userTeams = await TeamModel.find({ user_id: req.user._id }, '_id');
//         const excludedTeamIds = userTeams.map((team) => team._id);




//         // Build the dynamic query
//         const query = {
//             _id: { $nin: excludedTeamIds }, // Exclude user's teams
//         };

//         // Add game filter if provided
//         if (game) {
//             query.games = game;
//         }

//         // Add search term filter if provided
//         if (searchTerm) {
//             query.teamName = { $regex: `^${searchTerm}`, $options: 'i' }; // Case-insensitive match
//         }

//         // Fetch teams based on the dynamic query
//         const teams = await TeamModel.find(query);

//         const schedules = await Promise.all(
//             excludedTeamIds.map(async (id) => {
//                 return await ScheduledMatchModel.findOne({
//                     $or: [
//                         { userTeamId: id },
//                         { opponentId: id }
//                     ]
//                 });
//             })
//         );

//         const nonEmptySchedules = schedules.filter(Boolean);

//         // Fetch team members and count for each team
//         const teamsWithMembers = await Promise.all(
//             teams.map(async (team) => {
//                 const members = await AddTeamMemberModel.find({ teamId: team._id, status: 1 });
//                 return {
//                     ...team.toObject(), // Convert mongoose document to plain object
//                     teamMembers: members,
//                     members: members.length
//                 };
//             })
//         );

//         // Send response
//         return res.json(reply.success(Lang.TEAM_FETCH, teamsWithMembers));
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };




const setActiveTeam = async (req, res) => {
    try {
        const { teamId, teamName, logo } = req.body;
        // await UserModel.findOneAndUpdate({ _id: req.user._id }, { $set: { team: { team_Id: teamId, team_name: teamName, logo } } });
        return res.json(reply.success(Lang.SUCCESS, ""));
    } catch (error) {
        return res.status(500).json(reply.error("error setting active team", error.message));
    }
}


//     try {
//         const { _id, teamId, type, teamName, player_id } = req.body;
//         const user = await UserModel.findOne({ _id: req.user._id })

//         let user_id = type === "manage" ? player_id : await TeamModel.findOne({ _id: teamId }).user_id

//         console.log(user_id)

//         if (type === ("manage" || "member" || "leave")) {
//             await AddTeamMemberModel.findOneAndDelete({ _id });
//         }

//         if (type === "leave") {
//             const mst = new MessageModel({
//                 from: req.user._id,
//                 to: teamId,
//                 message: ${user.userName} leave this team,
//                 isDelivered: true
//             })
//             mst.save();
//         }

//         let message = type === "manage" ? ${teamName} removed you from their team  : ${user.userName} leave you team ${teamName}
//         const notif = new NotificationModel({
//             type_id: _id,
//             user_id,
//             type: "request",
//             message,
//             status: 1,
//         })
//         notif.save()
//         return res.status(200).json(reply.success(Lang.SUCCESS, ""));
//     } catch (error) {
//         return res.status(500).json(reply.error("Error deleting team member", error.message));
//     }
// }

// in this function message need to be send in team group 


const deleteTeamMember = async (req, res) => {
    // try {
    //     const { _id, teamId, type, teamName, player_id } = req.body;

    //     // Fetch user details
    //     const user = await UserModel.findById(req.user._id);

    //     if (!user) {
    //         return res.status(404).json(reply.failure("User not found"));

    //     }

    //     // Determine user_id based on the type
    //     const user_id =
    //         type === "manage"
    //             ? player_id
    //             : (await TeamModel.findById(teamId))?.user_id;

    //     if (!user_id) {
    //         return res.status(404).json(reply.failure("Team or user not found"));
    //     }

    //     // Handle deletion based on type
    //     if (["manage", "member", "leave"].includes(type)) {
    //         await AddTeamMemberModel.findByIdAndDelete(_id);
    //     }
    //     // if (type === "member") {
    //     //     const nofti = await NotificationModel.findOneAndDelete({ type_id: _id })
    //     //     if (!nofti) {
    //     //         return res.status(404).json(reply.failure("notification id not found"))
    //     //     }
    //     // }

    //     // Create a message if the type is "leave"
    //     if (type === "leave") {
    //         // const message = new MessageModel({
    //         //     from: req.user._id,
    //         //     to: teamId,
    //         //     message: `${user.userName} left this team`,
    //         //     isDelivered: true,
    //         // });
    //         // await message.save();
    //     }

    //     // Create a notification
    //     const notifMessage =
    //         type === "manage"
    //             ? `${teamName} removed you from their team`
    //             : `${user.userName} left your team ${teamName}`;

    //     // const notification = new NotificationModel({
    //     //     type_id: _id,
    //     //     user_id,
    //     //     type: "request",
    //     //     message: notifMessage,
    //     //     status: 1,
    //     // });
    //     await notification.save();
    //     return res.status(200).json(reply.success(Lang.SUCCESS, ""));
    // } catch (error) {
    //     return res.status(500).json(reply.failure("Error deleting team member"));
    // }
};


const updateTeam = async (req, res) => {
    try {
        const { _id, teamName, email, phoneNumber, noOfPlayers, homeGround, addressOfGround, games, joinTeam, description } = req.body;
        const team = await TeamModel.findOneAndUpdate({ _id }, { $set: { teamName, email, phoneNumber, noOfPlayers, homeGround, addressOfGround, games, joinTeam, description } });
        if (!team) { return res.json(reply.failure("Team not found")) }
        return res.json(reply.success(Lang.SUCCESS, ""));
    } catch (error) { return res.status(500).json(reply.error("error updating team", error.message)); }
}

const getMatches = async (req, res) => {
    try {
        const user = req.user._id;

        // Fetch the team IDs directly without intermediate variables
        const teamIds = await AddTeamMemberModel.find({ playerId: user, status: 1 }).distinct('teamId');

        // Fetch matches with sessionId added in one step
        const matches = await ScheduledMatchModel.find({
            $and: [
                // Team condition
                {
                    $or: [
                        { userTeamId: { $in: teamIds } },
                        { opponentId: { $in: teamIds } }
                    ]
                },
                // Status and reMatch conditions
                {
                    $or: [
                        { status: { $in: [1, 2] } },  // Accepted or completed matches
                        { reMatch: 1 }                 // Rematch games
                    ]
                }
            ]
        })
            .populate([
                { path: 'opponentId' },
                { path: 'userTeamId' }
            ])
            .lean() // Convert documents to plain objects in one go
            .then((matchData) =>
                matchData.map((match) => ({
                    ...match,
                    sessionId: user
                }))
            );

        return res.json(reply.success(Lang.MATCHES_FETCHED, matches));
    } catch (error) {
        return res.status(500).json(reply.failure(Lang.MATCHES_FETCH_FAILED, error.message));
    }
};


const fetchScoreCards = async (req, res) => {
    try {
        // const scoreCards = await ScoreCardModel.find().sort({ createdAt: 1 })
        // return res.json(reply.success(Lang.MATCHES_FETCHED, scoreCards));
    } catch (error) {
        return res.status(500).json(reply.error(Lang.MATCHES_FETCH_FAILED, error.message));

    }
}


const handleTeamRequest = async (req, res) => {
    try {
        const { request, type, team, teamName } = req.body;
        const messageType = (type === "team request") ? "teamRequest" : "Friend Request"
        let type_id
        const message = await UserModel.findOne({ _id: req.user._id })
        const user = await UserModel.findOne({ _id: request });

        if (type === "team request") {
            const reques = new AddTeamMemberModel({
                userId: req.user._id,
                playerId: request,
                userName: user.userName,
                teamId: team,
                status: 0,
                commit: "Player"
            });
            type_id = reques._id
            reques.save();
        }
        if (type === "Friend Request") {
            const Request = new FriendModel({
                user_id: req.user._id,
                request: request,
                status: 0,
                commit: "add request",
                type: "request"
            });
            type_id = Request._id
            Request.save();
        }
        const notification = new NotificationModel({
            type_id,
            user_id: request,
            type: "request",
            message: {
                name: message.userName,
                type: messageType,
                team: team,
                teamName: teamName
            },
            status: 0
        })

        notification.save();

        return res.json(reply.success())
    } catch (err) {
        res.json({ error: err.message });
    }
}

// const handleApproval = async (req, res) => {
//     try {
//         const { approve, type, teamName, userId } = req.body
//         if (type === "match") {
//             await ScheduledMatchModel.findOneAndUpdate({ _id: approve }, { $set: { status: 1 } });
//         }
//         if (type === "request") {
//             await FriendModel.findOneAndUpdate({ _id: approve }, { $set: { status: 1, commit: "request accepted" } });
//         }
//         if (type === "teamRequest") {
//             await ScheduledMatchModel.findOneAndUpdate({ _id: approve }, { $set: { status: 1, commit: "request accepted" } });
//         }

//         await NotificationModel.findOneAndUpdate({ type_id: approve, status: 0 }, { $set: { status: 1 } });
//         return res.json(reply.success("Approved"))
//     } catch (err) {
//         return res.json(err)
//     }
// }

// const addFriend = async (req, res) => {
//     try {
//         const _id = req.user._id;
//         const { playerId, userName, teamId, type, teamName } = req.body;

//         // const team = await TeamModel.findOne({ teamName });
//         const addplayer = new AddTeamMemberModel({
//             userId: _id,
//             playerId,
//             userName,
//             teamId,
//             status: 1,
//             commit: "Player"
//         });

//         const notif = new NotificationModel({
//             type_id: addplayer._id,
//             user_id: playerId,
//             type: "request",
//             message: `${teamName} added you in team `,
//             status: 1,
//         })
//         notif.save()
//         addplayer.save()
//         return res.json(reply.success(Lang.SUCCESS))
//     } catch (err) {
//         return res.json(err)
//     }
// }

module.exports = {
    getTeam,
    handleTeamRequest,
    manageScore,
    getTeamProfile,
    handleMatchRequest,
    getTeams,
    setActiveTeam,
    deleteTeamMember,
    updateTeam, getMatches, fetchScoreCards, registerTeam
}