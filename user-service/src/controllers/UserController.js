const UserModel = require("../models/user")
const reply = require("../helper/reply");
const { getTeamByUser } = require("./GrpcController");
// const Lang = require("../language/en")
// const { CountryModel } = require("../model/country")
// const { TournamentModel } = require("../model/tournament")
// const { TeamModel } = require("../model/team")
// const { StateModel } = require("../model/state")
// const { CityModel } = require("../model/city")
// const { FriendModel } = require("../model/useFriends")
// const { ProductModel } = require("../model/product")
// const { AddTeamMemberModel } = require("../model/addTeamMember")
// const TournamentTeamsModel = require("../model/tournamentEntry")
// const { MessageModel } = require("../model/messages")
// const { NotificationModel } = require("../model/notification")
// const { ScheduledMatchModel } = require("../model/scheduledMatch")
// const { setFriends, setTeams } = require("../utils/getFriend")
// const WebSocket = require('ws');



const getProfile = async (req, res) => {
    let userId;
    if (req.params.id) {
        userId = req.params.id;
    } else {
        userId = req.user?._id;
    }

    try {
        const user = await UserModel.findOne({ _id: userId });

        if (!user) {
            // const team = await TeamModel.findOne({ _id: userId });

            // if (!team) {
            //     return res.status(404).json(reply.failure("User does not exist"));
            // }
            return res.json(reply.success("team", "team"));

        }

        const teams = await getTeamByUser(userId)
            .then((teamData) => {
                console.log('Team Data:', teamData);
                // Process the team data as needed
            })
            .catch((error) => {
                console.error('Failed to retrieve team data:', error);
                // Handle the error appropriately
            });

        // Fetch teams created by the user
        // const teams = await TeamModel.find({ user_id: userId });

        // // Extract teamIds from the user's teams
        // const teamIds = teams.map(team => team._id);

        // // Find other teams where the user is a member, excluding their own teams
        // const filteredTeams = await AddTeamMemberModel.find({
        //     teamId: { $nin: teamIds },
        //     playerId: userId
        // });

        // // Initialize user.otherTeams if not already initialized
        // user.otherTeams = [];

        // // Fetch data for teams where the user is a member but not the owner
        // const otherTeamsWithDetails = await Promise.all(filteredTeams.map(async (team) => {
        //     const teamData = await TeamModel.findOne({ _id: team.teamId });
        //     const membersCount = await AddTeamMemberModel.countDocuments({ teamId: team.teamId });
        //     return { ...teamData.toObject(), status: team.status, members: membersCount };
        // }));

        // user.otherTeams.push(...otherTeamsWithDetails);

        // // Fetch team members count for each team in parallel
        // const teamsWithMembers = await Promise.all(teams.map(async (team) => {
        //     const membersCount = await AddTeamMemberModel.countDocuments({ teamId: team._id });
        //     return { ...team.toObject(), members: membersCount };
        // }));

        // //fetching friends of user
        // const friends = await setFriends(userId);

        // // Add the teams with members to the user object
        // user.userTeams = teamsWithMembers;
        // user.friends = friends

        return res.status(200).json(reply.success("Profile fetched successfully", user));
    } catch (err) {
        console.log("kjsdn")
        return res.status(500).json(reply.failure(err.message));
    }
};

// const UpdateProfile = async (req, res) => {
//     const { userName, email, phoneNumber, address, } = req.body;
//     const updateData = { userName, email, phoneNumber, address };
//     if (req.file) {
//         updateData.profilePicture = req.file.location; // S3 URL
//     }

//     try {
//         await UserModel.findOneAndUpdate({ _id: req.user._id }, { $set: updateData }, {
//             new: true
//         });
//         return res.json(reply.success())

//     } catch (err) {
//         res.send(err)
//     }

// }

// const getcountry = async (req, res) => {
//     try {
//         const country = await CountryModel.find();
//         return res.json(reply.success("", country))
//     } catch (err) {
//         res.send(err.message)
//     }
// }

// const getstate = async (req, res) => {
//     try {
//         const state = await StateModel.find({ country_name: req.params.country });
//         return res.json(reply.success("", state))

//     } catch (err) {
//         res.send(err.message)
//     }
// }

// const getcity = async (req, res) => {
//     try {
//         const city = await CityModel.find({
//             state_name: req.params.state
//         });
//         return res.json(reply.success("", city))

//     } catch (err) {
//         res.send(err.message)
//     }
// }


// const getFriends = async (req, res) => {
//     try {
//         const session_id = req.user._id;
//         const searchTerm = req.query.q || ''; // Get the search query from the request, default to empty string if not provided
//         const users = await UserModel.find({ _id: { $ne: session_id }, userName: { $regex: `^${searchTerm}`, $options: 'i' } })
//             .select("_id userName team profilePicture");

//         const friendRequests = await FriendModel.find({
//             $or: [
//                 { user_id: session_id },
//                 { request: session_id }
//             ]
//         });

//         const friendStatusMap = {};
//         friendRequests.forEach((request) => {
//             const key = request.user_id === session_id ? request.request : request.user_id;
//             friendStatusMap[key] = request;
//         });

//         const userList = users.map((user) => ({
//             ...user.toObject(),
//             friends: friendStatusMap[user._id] || null
//         }));

//         const check = friendRequests.filter((request) => request.request === session_id);
//         return res.json(reply.success("Users fetched successfully", { users: userList, check }));
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// const searchFriends = async (req, res) => {
//     try {
//         const session_id = req.user._id;
//         const searchQuery = req.query.q || ''; // Get the search query from the request, default to empty string if not provided

//         // Find users whose usernames start with the search query and exclude the session user
//         var users = await UserModel.find({
//             _id: { $ne: session_id },
//             userName: { $regex: `^${searchQuery}`, $options: 'i' } // Case-insensitive regex search
//         });

//         // Add friends data to the users
//         for (let i = 0; i < users.length; i++) {
//             const data = await FriendModel.findOne({ request: users[i]._id, user_id: session_id });
//             users[i].friends = data ? data : null;
//         }

//         // Fetch all teams
//         const teams = await TeamModel.find();

//         return res.json(reply.success("Users fetched successfully", { users, teams }));
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // const searchFriends = async (req, res) => {
// //     try {
// //         const session_id = req.user._id
// //         var users = await UserModel.find({ _id: { $ne: session_id } });
// //         // users = users.filter((e) => e._id != session_id)
// //         for (let i = 0; i < users.length; i++) {
// //             const data = await FriendModel.findOne({ request: users[i]._id, user_id: session_id });
// //             users[i].friends = (data) ? data : null;
// //         }
// //         const teams = await TeamModel.find()
// //         return res.json(reply.success("Users fetched successfully", { users, teams }));
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // }


// const getFriend = async (req, res) => {
//     try {
//         const { request, type, team, teamName } = req.body;
//         const messageType = (type === "team request") ? "teamRequest" : "Friend Request"
//         let type_id
//         const message = await UserModel.findOne({ _id: req.user._id })
//         const user = await UserModel.findOne({ _id: request });

//         if (type === "team request") {
//             const reques = new AddTeamMemberModel({
//                 userId: req.user._id,
//                 playerId: request,
//                 userName: user.userName,
//                 teamId: team,
//                 status: 0,
//                 commit: "Player"
//             });
//             type_id = reques._id
//             reques.save();
//         }
//         if (type === "Friend Request") {
//             const Request = new FriendModel({
//                 user_id: req.user._id,
//                 request: request,
//                 status: 0,
//                 commit: "add request",
//                 type: "request"
//             });
//             type_id = Request._id
//             Request.save();
//         }
//         const notification = new NotificationModel({
//             type_id,
//             user_id: request,
//             type: "request",
//             message: {
//                 name: message.userName,
//                 type: messageType,
//                 team: team,
//                 teamName: teamName
//             },
//             status: 0
//         })

//         notification.save();

//         return res.json(reply.success())
//     } catch (err) {
//         res.json({ error: err.message });
//     }
// }

// const getProduct = async (req, res) => {
//     try {
//         const products = await ProductModel.find();
//         return res.json(products);
//     } catch (err) {
//         return res.status(500).json({ message: "Error fetching products" }, err);
//     }
// }



// const handleDelete = async (req, res) => {
//     try {
//         const { _id, type } = req.body;
//         if (type === "manage") {
//             await AddTeamMemberModel.findOneAndDelete({ _id });
//         }
//         if (type === "request") {
//             await FriendModel.findOneAndDelete({ _id });
//         }
//         if (type === "match") {
//             await ScheduledMatchModel.findOneAndDelete({ _id })
//         }
//         await NotificationModel.findOneAndDelete({ type_id: _id })
//         return res.json(reply.success())
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }



// const getTournamentInfo = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const tournamnet = await TournamentModel.findOne({ _id: id });
//         return res.json(tournamnet)
//     }
//     catch (err) {
//         res.json({ error: err.message });
//     }
// }

// const handleApproval = async (req, res) => {
//     try {
//         const { approve, type, teamName, userId } = req.body

//         if (type === "teamRequest") {
//             // const team = await TeamModel.findOneAndUpdate({ teamName }, {
//             //     $push: {
//             //         teamMembers: {
//             //             _id: new mongoose.Types.ObjectId(),
//             //             user_id: userId,
//             //             player_id: req.user._id,
//             //             user_name: req.user.userName,
//             //             status: 1,
//             //             commit: "Player"
//             //         }
//             //     }
//             // });
//             // await UserModel.findOneAndUpdate({ _id: req.user._id }, {
//             //     $push: {
//             //         requestedTeams: {
//             //             team_Id: team._id,
//             //             team_name: teamName,
//             //             logo: team.logo || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop",
//             //             sport: team.games,
//             //             location: team.addressOfGround,
//             //             status: 0
//             //         }
//             //     }
//             // })
//             // return res.json(reply.success("Approved"))
//         }
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


// const getPlayingFriends = async (req, res) => {
//     try {
//         const user_id = req.user._id;
//         const friends = await FriendModel.find({ user_id: user_id })
//             .populate({ path: "request", select: ["userName", "phoneNumber", "team", "_id"] })
//         const friend = await FriendModel.find({ request: user_id })
//             .populate({ path: "user_id", select: ["userName", "phoneNumber", "team", "_id"] })

//         for (let i = 0; i < friends.length; i++) {
//             const data = await AddTeamMemberModel.findOne({ player_id: friends[i].request._id })
//             friend[i].friends = (data) ? data : null
//         }

//         for (let i = 0; i < friend.length; i++) {
//             const data = await AddTeamMemberModel.findOne({ player_id: friend[i].user_id._id })
//             friend[i].friends = (data) ? data : null
//         }

//         return res.json({ friends, friend });

//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };
// const getUserFriends = async (req, res) => {
//     try {
//         const user_id = req.user._id;
//         const friends = await FriendModel.find({
//             $or: [
//                 { user_id: user_id },
//                 { request: user_id }
//             ]
//         }).populate({
//             path: "user_id request",
//             select: ["userName", "phoneNumber", "team", "_id", "profilePicture"]
//         });

//         const userFriends = await setFriends(user_id)
//         const userTeams = await setTeams(user_id)

//         userFriends.recentMessage = ""
//         userFriends.pendingMessages = 0

//         for (const friend of friends) {
//             const messages = await MessageModel.find({ to: friend.request, $or: [{ status: 1 }, { status: 0 }] })
//             friend.session_id = user_id;
//             friend.pendingMessage = messages
//         }

//         friends.session_id = user_id

//         return res.json(reply.success(Lang.SUCCESS, { friends, userFriends, userTeams }));

//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };


// const getTeams = async (req, res) => {
//     try {
//         const game = req.params.game;
//         const Teams = await TeamModel.find();
//         return res.json(Teams)
//     } catch (err) {
//         return res.json(err)
//     }
// }

// const setteam = async (req, res) => {
//     try {
//         const {
//             games,
//             teamName,
//             email,
//             phoneNumber,
//             noOfPlayers,
//             substitute,
//             homeGround,
//             addressOfGround,
//             pinCode,
//             description,
//             members,
//             logo
//         } = req.body

//         const team = new TeamModel({
//             user_id: req.user._id,
//             teamName,
//             email,
//             phoneNumber,
//             noOfPlayers,
//             substitute,
//             homeGround,
//             addressOfGround,
//             pinCode,
//             description,
//             members,
//             games,
//             joinTeam: false,
//         })
//         const player = new AddTeamMemberModel({
//             userId: req.user._id,
//             playerId: req.user._id,
//             userName: req.user.userName,
//             teamId: team._id,
//             status: 1,
//             commit: "Captain"
//         });

//         await UserModel.findOneAndUpdate({ _id: req.user._id }, {
//             $set: {
//                 team: {
//                     team_Id: team._id,
//                     team_name: teamName,
//                     logo: logo || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop"
//                 }
//             }
//         })

//         team.save();
//         player.save();

//         return (
//             res.json(reply.success(Lang.REGISTER_SUCCESS, team.
//                 _id))
//         )
//     } catch (err) {
//         res.status(402).json({ error: err.message });


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

// const getPlayers = async (req, res) => {
//     try {
//         if (req.params.type === "joinTeam") {
//             const addedPlayer = await AddTeamMemberModel.find({ playerId: req.user._id })
//             if (!addedPlayer) {
//                 return res.json(reply.failure("Fetched Scuccesfuly"))
//             }
//             return res.json(reply.success("Fetched Scuccesfuly", addedPlayer))

//         }
//         const addedPlayer = await AddTeamMemberModel.find({ userId: req.user._id }).populate({ path: "playerId", select: ["userName", "_id"] })
//         return res.json(reply.success("Fetched Scuccesfuly", addedPlayer))
//     } catch (err) {
//         return res.json(err)
//     }
// }


// const messageControl = async (ws, data, wss) => {
//     try {
//         const { from, to, message, messageType, teamId, type } = data.data
//         const user = await UserModel.findOne({ _id: from })
//         if (!user) {
//             console.log("user not found")
//             return false;
//         }
//         if (!from || !message || !messageType) {
//             console.error("Missing required fields");
//             return false;
//         }
//         let status = 0
//         if (wss.clients) {
//             wss.clients.forEach(element => {
//                 if (element.userId == to) {
//                     status = 2
//                 }
//             });
//         }

//         const newMessage = new MessageModel({
//             from: ws.userId,
//             to,
//             teamId,
//             message,
//             userName: user.userName,
//             messageType,
//             status
//         })
//         await newMessage.save();

//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN &&
//                 ((client.userId === from || client.userId === to))) {
//                 client.send(JSON.stringify({
//                     type: 'message_update',
//                     newMessage
//                 }));
//             }
//         });

//     } catch (err) {
//         console.log({ msg: "error in backend" }, err)
//     }
// }

// const getChat = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { type } = req.query;
//         const userId = req.user._id;

//         if (!type && !id && !userId) {
//             return res.status(400).json({ msg: "Parameter not passsed correctly" });
//         }
//         let query;
//         if (type === 'direct') {
//             query = {
//                 $or: [
//                     { from: userId, to: id },
//                     { from: id, to: userId }
//                 ],
//                 messageType: 'direct'  // Ensure the correct field name
//             };
//         } else if (type === 'team') {
//             query = { teamId: id };

//         } else {
//             return res.status(400).json({ message: 'Invalid chat type' });
//         }


//         const messages = await MessageModel.find(query).sort({ createdAt: 1 });

//         messages.forEach(element => {
//             element.sessionId = req.user._id
//         });

//         return res.json(reply.success("Message fetched Succesfully", messages));
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         return res.status(500).json({ message: 'Error fetching messages' });
//     }
// };

// // const getChat = async (req, res) => {
// //     try {
// //         const friendId = req.params.friendId
// //         const userId = req.user._id
// //         const data = await MessageModel.find({
// //             $or: [
// //                 { from: userId, to: friendId },
// //                 { from: friendId, to: userId }
// //             ]
// //         }).sort({ createdAt: 1 })

// //         if (!type && !id && !userId) {
// //             return res.status(400).json({ msg: "Parameter not passsed correctly" });
// //         }
// //         let query;
// //         if (type === 'direct') {
// //             query = {
// //                 $or: [
// //                     { from: userId, to: id },
// //                     { from: id, to: userId }
// //                 ],
// //                 messageType: 'direct'  // Ensure the correct field name
// //             };
// //         } else if (type === 'team') {
// //             query = { teamId: id };

// //         } else {
// //             return res.status(400).json({ message: 'Invalid chat type' });
// //         }


// //         const messages = await MessageModel.find(query).sort({ createdAt: 1 });



// //         res.json({ status: true, data: messages.length ? messages : [] });
// //     } catch (error) {
// //         console.error('Error fetching messages:', error);
// //         res.status(500).json({ message: 'Error fetching messages' });
// //     }
// // };
// const getRecivedMessage = async (req, res) => {
//     try {
//         const user_id = req.user._id;
//         const data = await MessageModel.find({ friend: user_id })
//         return res.json(data)
//     } catch (err) {
//         return res.json({ msg: "error in Reciviing Message" }, err)
//     }
// }

// const searching = async (req, res) => {
//     try {
//         const search = req.params.search
//         const data = await UserModel.find({ firstName: search })
//         if (data) {
//             return res.json(data)
//         }
//         return res.json({ msg: "User not exist" })
//     } catch (err) {
//         return res.json("error in searching", err)
//     }
// }


// const statusControl = async (ws, data, wss) => {
//     try {
//         const isOffline = data.data.statusType === "offline"
//         if (data.data.statusType === "offline") {
//             await UserModel.findOneAndUpdate({ _id: ws.userId }, {
//                 $set: {
//                     active: false
//                 }
//             })

//         } else {
//             await MessageModel.updateMany(
//                 {
//                     from: data.matchId,
//                     to: ws.userId,
//                     status: 0
//                 },
//                 {
//                     $set: {
//                         status: 1,
//                     }
//                 }
//             );
//             await UserModel.findOneAndUpdate({ _id: ws.userId }, {
//                 $set: {
//                     active: true
//                 }
//             })
//         }

//         if (wss.clients) {
//             wss.clients.forEach(client => {
//                 if (client.readyState === WebSocket.OPEN
//                 ) {
//                     client.send(JSON.stringify({
//                         type: 'message_update',
//                         status: isOffline
//                     }));
//                 }
//             });
//         }
//         return
//     } catch (error) {
//         console.error('Error updating message statuses:', error);
//     }


// }





module.exports = {
    getProfile,

    // setteam, getcountry, getstate, getcity, UpdateProfile, getFriends, getFriend, getProduct, handleDelete, getTournamentInfo, handleApproval, getUserFriends, getTeams, addFriend, getPlayers, messageControl, getChat, getRecivedMessage, searchFriends, searching, getPlayingFriends, statusControl 

}