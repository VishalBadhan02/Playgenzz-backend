const reply = require("../helper/reply");
const Lang = require("../language/en")
const UserModel = require("../models/user")
// const { TournamentModel } = require("../model/tournament")
// const { TeamModel } = require("../model/team")
// const { FriendModel } = require("../model/useFriends")
// const { ProductModel } = require("../model/product")
// const { AddTeamMemberModel } = require("../model/addTeamMember")
// const TournamentTeamsModel = require("../model/tournamentEntry")
// const { MessageModel } = require("../model/messages")
// const { NotificationModel } = require("../model/notification")
// const { ScheduledMatchModel } = require("../model/scheduledMatch")
const { getTeamByUser } = require("./GrpcController");
const { setFriends } = require("../helper/getUserFriends");
const userService = require("../services/userService");
const { getFriendStatusMap, mapUserListWithFriends } = require("../utils/friends");
const WebSocket = require('ws');





const getProfile = async (req, res) => {
    let userId;
    if (req.params.id) {
        userId = req.params.id;
    } else {
        userId = req.user?._id;
    }

    try {
        // const user = await UserModel.findOne({ _id: userId });
        const user = await userService.findUser(userId);

        if (!user) {
            return res.status(409).json(reply.failure(Lang.USER_NOT_FOUND));
        }

        const teams = await getTeamByUser(userId)
            .then((teamData) => {
                return teamData;
                // Process the team data as needed
            })
            .catch((error) => {
                console.error('Failed to retrieve team data:', error);
                // Handle the error appropriately
            });

        // fetch user friends from friends modal
        const friends = await setFriends(userId)

        user.userTeams = teams.teams
        user.friends = friends

        return res.status(200).json(reply.success(Lang.USER_PROFILE, user));
    } catch (err) {
        console.log("Error in getProfile", err)
        return res.status(500).json(reply.failure(err.message));
    }
};

const searchUsers = async (req, res) => {
    try {
        const session_id = req.user._id;
        const searchTerm = req.query.q || '';

        if (!session_id) {
            return res.status(401).json(reply.failure("Unauthorized: User not authenticated"));
        }

        // ✅ Fetch users excluding the session user
        const users = await userService.findFriends(session_id, searchTerm);

        // ✅ Fetch friend requests
        const friendRequests = await userService.friendRequests(session_id);

        if (!users.length) {
            return res.status(404).json(reply.failure("No users found"));
        }

        // ✅ Process friend status using utility function
        const friendStatusMap = getFriendStatusMap(friendRequests, session_id);

        // ✅ Process user list using utility function
        const userList = mapUserListWithFriends(users, friendStatusMap);

        const check = friendRequests.filter((request) => request.request === session_id);

        return res.status(200).json(reply.success("Users fetched successfully", { users: userList, check }));

    } catch (err) {
        console.error("Error fetching friends:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const UpdateProfile = async (req, res) => {
    try {
        const { userName, email, phoneNumber, address } = req.body;
        const updateData = { userName, email, phoneNumber, address };

        if (req.file) {
            updateData.profilePicture = req.file.location; // S3 URL
        }


        // ✅ Ensure user ID exists
        if (!req.user || !req.user._id) {
            return res.status(401).json(reply.failure(Lang.UNAUTHORIZED));
        }

        // ✅ Validate Input (Optional but Recommended)
        if (!userName && !email && !phoneNumber && !address) {
            return res.status(400).json(reply.failure("No valid fields to update"));
        }

        const uniqueUserName = await userService.UniqueUserName(req.user._id, userName)

        if (!uniqueUserName) {
            return res.status(400).json(reply.failure({ type: "userName", message: Lang.USER_NAME_EXIST }));
        }


        // ✅ Update User Profile
        const updatedUser = await userService.updateProfile(req.user._id, updateData);

        if (!updatedUser) {
            return res.status(404).json(reply.failure(Lang.USER_NOT_FOUND));
        }

        return res.status(200).json(reply.success(Lang.USER_UPDATED, { user: updatedUser }));
    } catch (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json(reply.failure("Internal Server Error"));
    }
};

const handleRequest = async (req, res) => {
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
    searchUsers,
    UpdateProfile,
    handleRequest,
    //   handleDelete, getTournamentInfo, handleApproval, getUserFriends,  addFriend, getPlayers, messageControl, getChat, getRecivedMessage, searching, getPlayingFriends, statusControl 

}