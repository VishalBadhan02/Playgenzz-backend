const reply = require("../helper/reply");
const Lang = require("../language/en")
const { getTeamByUser } = require("./GrpcController");
const { setFriends } = require("../helper/getUserFriends");
const userService = require("../services/userService");
const { getFriendStatusMap, mapUserListWithFriends } = require("../utils/friends");
const sendMessage = require("../kafka/producer");
const { getParticipantsWithDetails } = require("../utils/groupParticipents");
const messageService = require("../services/messageService");
const Config = require("../config");
const Conversation = require("../models/conversationSchema");
const { storeConversationModal, getConversationModal, storeProfileData, getProfileData, deleteProfileData } = require("../services/redisServices");
const { getParticipantDisplayData } = require("../utils/getParticipantDisplayData");
const { formatedChatData } = require("../utils/formatedChatData");
const grpcService = require("../services/grpcService");
const MediaModel = require("../models/mediaSchema");
const { updateProfileSchema, searchSchema } = require("../validations/profileValidation");
const { getSearchResults } = require("../utils/getSearchResults");

//this api is done
const getProfile = async (req, res) => {
    const sessionUserId = req.user?._id;
    const profileUserId = req.params.id || sessionUserId;

    try {
        let user = await getProfileData(profileUserId);

        if (!user) {
            user = await userService.findUser(profileUserId);
            if (!user) {
                return res.status(409).json(reply.failure(Lang.USER_NOT_FOUND));
            }
            await storeProfileData(profileUserId, user);
        }

        // Clone to avoid mutating Redis object
        user = { ...user };


        // const teams = await getTeamByUser(profileUserId).catch((error) => {
        //     console.error("Failed to retrieve team data:", error);
        // });
        const teams = [];
        user.userTeams = teams?.teams || [];
        user.otherTeams = teams?.otherTeamsWithDetails || [];
        user.userTeamsCount = teams?.teams?.length || "0"
        user.otherTeamsCount = teams?.otherTeamsWithDetails?.length || "0"

        if (sessionUserId.toString() === profileUserId.toString()) {
            const friends = await setFriends(sessionUserId);
            user.friends = friends;
            user.friendCount = friends?.length || 0;
        } else {
            const isFriend = await userService.userFriendForCurrentPage(sessionUserId, profileUserId);
            user.friend = isFriend;

            // Also include friend count if needed on other profiles
            const allFriends = await setFriends(profileUserId);
            user.friendCount = allFriends?.length || 0;
        }

        // all the user stats including tournaments, victory getting fetched here
        const carrer = await userService.fetchUserCarrerStats(sessionUserId)
        user.carrer = carrer

        return res.status(200).json(reply.success(Lang.USER_PROFILE, user));
    } catch (err) {
        console.log("Error in getProfile", err);
        return res.status(500).json(reply.failure(err.message));
    }
};

//also need to fetch wheater user is already a friend or not
const searchUsers = async (req, res) => {
    try {
        const sessionId = req.user._id;


        if (!sessionId) {
            return res.status(401).json(reply.failure("Unauthorized: User not authenticated"));
        }

        //✅ Validate query param with Zod
        const parsed = searchSchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json(reply.failure("Invalid query parameter"));
        }

        const searchTerm = req.query.q || '';


        // ✅ Call service layer
        const { userList, check } = await getSearchResults(sessionId, searchTerm);


        // // ✅ Fetch users excluding the session user
        // const users = await userService.findFriends(sessionId, searchTerm);

        // // ✅ Fetch friend requests
        // const friendRequests = await userService.friendRequests(sessionId);

        // // if (!users.length) {
        // //     return res.status(404).json(reply.failure("No users found"));
        // // }

        // // ✅ Process friend status using utility function
        // const friendStatusMap = getFriendStatusMap(friendRequests, sessionId);

        // // ✅ Process user list using utility function
        // const userList = mapUserListWithFriends(users, friendStatusMap);

        // const check = friendRequests.filter((request) => request.request === sessionId);

        return res.status(200).json(reply.success("Users fetched successfully", { users: userList, check }));

    } catch (err) {
        console.error("Error fetching friends:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//this api is done
const UpdateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json(reply.failure({
                type: "authorization",
                message: Lang.UNAUTHORIZED
            }));
        }

        // Special Case: Handle profile picture update separately
        if (req.file && req.file.location) {
            const updateData = { profilePicture: req.file.location };

            await userService.updateProfile(req.user._id, updateData);
            await deleteProfileData(req.user._id); // clear cache

            return res.status(200).json(reply.success(Lang.USER_UPDATED));
        }

        // Validate input data
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(reply.failure({
                type: "validation",
                message: parsed.error.errors.map(err => err.message)
            }));
        }

        const updateData = parsed.data;

        // If no valid fields provided
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json(reply.failure({
                type: "validation",
                message: "No valid fields to update"
            }));
        }

        // Uniqueness check for userName
        if (updateData.userName) {
            const uniqueUserName = await userService.UniqueUserName(req.user._id, updateData.userName);
            if (!uniqueUserName) {
                return res.status(400).json(reply.failure({
                    type: "userName",
                    message: Lang.USER_NAME_EXIST
                }));
            }
        }

        // Prepare gRPC data
        const grpcData = {
            id: req.user._id,
            name: updateData.userName,
            email: updateData.email,
            phoneNumber: updateData.phoneNumber,
        };

        // Call Auth Service first
        const grpcres = await grpcService.UpdateAuthService(grpcData);
        if (!grpcres.success) {
            return res.status(500).json(reply.failure({
                type: "authService",
                message: "Auth service update failed"
            }));
        }

        // Update local DB
        let updatedUser;
        try {
            updatedUser = await userService.updateProfile(req.user._id, updateData);
        } catch (err) {
            console.error("DB update failed after Auth update. Initiating rollback...", { error: err });

            try {
                const previousUser = await userService.findUser(req.user._id);
                if (previousUser) {
                    const rollbackData = {
                        id: req.user._id,
                        name: previousUser.userName,
                        email: previousUser.email,
                        phoneNumber: previousUser.phoneNumber,
                    };
                    await grpcService.UpdateAuthService(rollbackData);
                }
            } catch (rollbackErr) {
                console.error("Rollback failed", { rollbackError: rollbackErr });
            }

            return res.status(500).json(reply.failure({
                type: "localDB",
                message: "Local DB update failed after Auth update. System state may be inconsistent."
            }));
        }

        if (!updatedUser) {
            return res.status(404).json(reply.failure({
                type: "notFound",
                message: Lang.USER_NOT_FOUND
            }));
        }

        await deleteProfileData(req.user._id); // clear cache

        return res.status(200).json(reply.success(Lang.USER_UPDATED, { user: updatedUser }));

    } catch (err) {
        console.error("Unexpected error occurred while updating profile:", err);
        return res.status(500).json(reply.failure({
            type: "server",
            message: "Internal Server Error"
        }));
    }
};

//this api is done
const handleRequest = async (req, res) => {
    try {
        const { request } = req.body;

        if (!request) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        const senderId = req.user._id;

        // Find sender user details
        const user = await userService.findUser(senderId)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prepare friend request data
        const friendRequestData = {
            user_id: senderId,
            request: request,
            status: 0,
            commit: "add request",
            type: "request"
        }

        // ✅ Create friend request
        const friendRequest = await userService.addFriend(friendRequestData)
        if (!friendRequest) {
            return res.status(500).json({ error: "Failed to create friend request" });
        }

        const notificationData = {
            receiverId: request,           // Who receives this notification
            actorId: senderId,               // Who triggered the action
            type: Config.NOTIF_TYPE_REQUEST,// Type of notification (friend_request)
            entityId: friendRequest._id,// ID of the related entity (match, team, tournament, etc.)
            message: Config.NOTIF_MESSAGE,  // Readable message
            status: 0,                 // Status: unread, read, dismissed
            data: {
                type: "friend_request",
                name: user?.userName
            }
        }

        // ✅ Cache Invalidation (non-blocking)
        await Promise.allSettled([
            deleteProfileData(senderId),
            deleteProfileData(request)
        ]);

        await sendMessage("friend-request", notificationData)

        return res.status(200).json(reply.success());
    } catch (err) {
        res.json({ error: err.message });
    }
}

//this api is done
const handleDelete = async (req, res) => {
    try {
        const { _id } = req.body;
        // This service update the FriendModal means by updating this you will delete user from you friends list
        const friendRequest = await userService.friendModelDelete(_id);

        // we are deleting the cache when there is any change in friends there are stats which are changing 
        await Promise.allSettled([
            await deleteProfileData(friendRequest?.user_id),
            await deleteProfileData(friendRequest?.request)
        ])

        // if user undo the request inbetween then 1 mint then notification modal will get deleted but not friendmodal which exist in user-service, and this for data analytics
        if (friendRequest.operation === "delete") {
            await sendMessage("delete-request", { entityId: friendRequest?.friendRequest?._id, operation: "delete" })
            return res.status(200).json(reply.success());

        }

        // update the notification using same consumer in notification kafkacontroller the logic is writen if operation is delete the complete notification modal get deleted else it modal status get updated to 3 but not get deleted so no need to get confuded here
        await sendMessage("delete-request", { entityId: friendRequest?._id })

        return res.json(reply.success())
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const handleApproval = async (req, res) => {
    try {
        const { approvalData } = req.body
        // This service update the FriendModal means by updating this you will get friends of the other user
        const modal = await userService.friendModelUpdate(approvalData, 1, "request accepted")

        // notification send to the other user
        await sendMessage("update-request", { entityId: modal._id, type: "request accepted", status: 0 })
        await deleteProfileData(req.user._id)
        return res.json(reply.success("Approved"))
    } catch (err) {
        return res.json(err)
    }
}

const getUserFriends = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { t, id } = req.params;
        // If this is a new conversation request
        if (t === "n") {
            // getting the data for cache
            const cacheData = await getConversationModal(id)

            // if exist then user cache data else find it in the checkConvo mens in databse
            let existingConvo = cacheData ? cacheData : await messageService.checkConvo(user_id, id);

            //initializing the 
            let participants; participants

            //if coversation is not exist then we are creating new and store it in redis
            if (!existingConvo) {

                // formating the data to store in the database 
                participants = [
                    { entityId: user_id, entityType: "user" },
                    { entityId: id, entityType: "user" }
                ];

                // modal maked to store in the data base
                existingConvo = new Conversation({
                    participants: participants,
                    type: 'one-on-one',
                })
                // console.log(existingConvo)
                await storeConversationModal(existingConvo?._id, existingConvo)
            }
            const lastMsg = await messageService.getLastMessageForConversation(id);

            const displayData = await getParticipantDisplayData(existingConvo.participants, user_id);

            const data = {
                _id: existingConvo?._id,
                name: displayData?.name || "unknown",
                avatar: displayData?.profilePicture || "",
                status: "",
                lastMessage: lastMsg || "",
                lastMessageTime: "",
                unreadCount: 0,
                isTyping: false,
                type: "user"
            };

            return res.status(202).json(reply.success(Lang.SUCCESS, { userData: data, t }));
        }

        // Else, fetch contacts and friends
        const [userFriends, userTeams, userContacts] = await Promise.all([
            setFriends(user_id),
            //frtching the teams registered by the user
            getTeamByUser(user_id).catch(err => {
                console.error("Failed to retrieve team data:", err);
                return [];
            }),
            // fetching the conversations of the users
            userService.getUserContacts(user_id)
        ]);


        //formating the data assigning the names according to the id's
        const userChats = await getParticipantsWithDetails(userContacts, user_id);


        await deleteProfileData(req.user._id)

        return res.status(202).json(reply.success(Lang.SUCCESS, {
            userFriends,
            userTeams,
            userChats
        }));

    } catch (err) {
        console.error("getUserFriends error:", err);
        return res.status(500).json({ error: err.message || "Server Error" });
    }
};

const getChat = async (req, res) => {
    try {
        const { conversationId } = req.params

        const chat = await messageService.getMessage(conversationId)

        const formatedChats = await formatedChatData(chat, req.user._id)


        return res.status(202).json(reply.success("Message fetched Succesfully", formatedChats));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Error fetching messages' });
    }
};

const handleMediaUploads = async (req, res) => {
    try {
        const { kind, itemId, caption } = req.body;

        if (!['user', 'team', 'tournament'].includes(kind)) {
            return res.status(400).json({ message: 'Invalid kind provided' });
        }

        const mediaFiles = req.files.map(file => ({
            url: file.location,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image'
        }));

        const newPost = new MediaModel({
            caption,
            media: mediaFiles,
            uploadedBy: req.user._id,
            belongsTo: {
                kind,
                item: itemId
            }
        });

        await newPost.save();

        res.status(200).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

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
    getChat,
    handleMediaUploads
    //     addFriend, getPlayers, getPlayingFriends, statusControl 


    

}













