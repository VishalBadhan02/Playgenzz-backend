const reply = require("../helper/reply");
const Lang = require("../language/en")
const UserModel = require("../models/user")
const { getTeamByUser } = require("./GrpcController");
const { setFriends } = require("../helper/getUserFriends");
const userService = require("../services/userService");
const { getFriendStatusMap, mapUserListWithFriends } = require("../utils/friends");
const WebSocket = require('ws');
const sendMessage = require("../kafka/producer");
const { MessageModel } = require("../models/messageModal");





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

        //this check wheathee current user is user frient or not on profile page
        const checkCurrentPage = await userService.userFriendForCurrentPage(req.user._id, userId)


        user.userTeams = teams.teams
        user.friends = friends
        user.friend = checkCurrentPage

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

        // if (!users.length) {
        //     return res.status(404).json(reply.failure("No users found"));
        // }

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
        const { request } = req.body;

        if (!request) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        // Find sender user details
        const user = await userService.findUser(req.user._id)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prepare friend request data
        const friendRequestData = {
            user_id: req.user._id,
            request: request,
            status: 0,
            commit: "add request",
            type: "request"
        }

        const friendRequest = await userService.addFriend(friendRequestData)
        if (!friendRequest) {
            return res.status(500).json({ error: "Failed to create friend request" });
        }

        const notificationData = {
            receiverId: request,           // Who receives this notification
            actorId: req.user._id,               // Who triggered the action
            type: "friend_request",           // Type of notification (friend_request, match_schedule, etc.)
            entityId: friendRequest._id,             // ID of the related entity (match, team, tournament, etc.)
            message: `${user?.userName} sent you a friend request`,  // Readable message
            status: 0,                 // Status: unread, read, dismissed
        }

        await sendMessage("friend-request", notificationData)
        return res.json(reply.success())
    } catch (err) {
        res.json({ error: err.message });
    }
}

const handleDelete = async (req, res) => {
    try {
        const { _id } = req.body;
        // if (type === "manage") {
        //     await AddTeamMemberModel.findOneAndDelete({ _id });
        // }

        // This service update the FriendModal means by updating this you will delete user from you friends list
        const modal = await userService.friendModelUpdate(_id, 2, "unFriend")

        //notification send to the other user
        await sendMessage("update-request", { entityId: modal._id, type: "unFriend" })

        // if (type === "match") {
        //     await ScheduledMatchModel.findOneAndDelete({ _id })
        // }
        // await NotificationModel.findOneAndDelete({ type_id: _id })
        return res.json(reply.success())
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const handleApproval = async (req, res) => {
    try {
        const { approve } = req.body

        // This service update the FriendModal means by updating this you will get friends of the other user
        const modal = await userService.friendModelUpdate(approve, 1, "request accepted")

        //notification send to the other user
        await sendMessage("update-request", { entityId: modal._id, type: "request accepted", status: 0 })

        return res.json(reply.success("Approved"))
    } catch (err) {
        return res.json(err)
    }
}

const getUserFriends = async (req, res) => {
    try {
        const user_id = req.user._id;

        const friends = userService.userFriends(user_id)

        // fetching the user friend from modal schema 
        const userFriends = await setFriends(user_id)

        const userTeams = await getTeamByUser(user_id)
            .then((teamData) => {
                return teamData;
                // Process the team data as needed
            })
            .catch((error) => {
                console.error('Failed to retrieve team data:', error);
                // Handle the error appropriately
            });

        // const userTeams = await setTeams(user_id)

        userFriends.recentMessage = ""
        userFriends.pendingMessages = 0

        for (const friend of friends) {
            const messages = await MessageModel.find({ to: friend.request, $or: [{ status: 1 }, { status: 0 }] })
            friend.session_id = user_id;
            friend.pendingMessage = messages
        }

        friends.session_id = user_id

        return res.json(reply.success(Lang.SUCCESS, { friends, userFriends, userTeams }));

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


const getChat = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const userId = req.user._id;

        if (!type && !id && !userId) {
            return res.status(400).json({ msg: "Parameter not passsed correctly" });
        }
        let query;
        if (type === 'direct') {
            query = {
                $or: [
                    { from: userId, to: id },
                    { from: id, to: userId }
                ],
                messageType: 'direct'  // Ensure the correct field name
            };
        } else if (type === 'team') {
            query = { teamId: id };

        } else {
            return res.status(400).json({ message: 'Invalid chat type' });
        }


        const messages = await MessageModel.find(query).sort({ createdAt: 1 });

        messages.forEach(element => {
            element.sessionId = req.user._id
        });

        return res.json(reply.success("Message fetched Succesfully", messages));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Error fetching messages' });
    }
};

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
















module.exports = {
    getProfile,
    searchUsers,
    UpdateProfile,
    handleRequest,
    handleDelete,
    handleApproval,
    getUserFriends,
    //     addFriend, getPlayers, getPlayingFriends, statusControl 

}














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
