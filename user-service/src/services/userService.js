const Conversation = require("../models/conversationSchema");
const { MessageModel } = require("../models/messageModal");
const { FriendModel } = require("../models/useFriends");
const UserModel = require("../models/user");
const UserStatsModel = require("../models/userStats");
const { deleteConversationModal } = require("./redisServices");

class UserService {
    constructor() { }

    // Find user by ID (Ensuring Status is "Active")
    async findUser(_id) {
        const user = await UserModel.findOne({ _id, status: "active" });
        return user || false; // Return false if user not found
    }

    // Find Friends by Username Search
    async findFriends(sessionId, searchTerm) {
        const query = {
            _id: { $ne: sessionId }
        };

        if (searchTerm) {
            query.userName = { $regex: `^${searchTerm}`, $options: "i" };
        }

        const users = await UserModel.find(query)
            .select("_id userName team profilePicture")
            .sort({ createdAt: -1 })
            .limit(7) // You can replace 7 with limit param if you add pagination later
            .lean();
        return users;
    }

    // handle friend request 
    async friendRequests(session_id) {
        const friendRequests = await FriendModel.find({
            $or: [
                { user_id: session_id },
                { request: session_id }
            ]
        });

        return friendRequests; // Always returns an array (empty if no users found)
    }

    // service to update profile
    async updateProfile(_id, updateData) {
        const user = await UserModel.findOneAndUpdate({ _id }, { $set: updateData }, {
            new: true
        });
        return user
    }

    async fetchUserCarrerStats(_id) {
        const carrer = await UserStatsModel.findOne({ _id })
        return carrer ? carrer : {}
    }

    // check the unique name
    async UniqueUserName(_id, userName) {
        try {
            const user = await UserModel.findOne({
                _id: { $ne: _id },
                userName,
            });
            return user ? false : true;
        } catch (error) {
            return error
        }
    }

    async addFriend(friendData) {
        try {
            const request = new FriendModel({
                ...friendData
            })
            await request.save()
            return request
        } catch (error) {
            return error
        }
    }

    async addFriend(friendData) {
        try {
            const request = new FriendModel({
                ...friendData
            })
            await request.save()
            return request
        } catch (error) {
            return error
        }
    }

    async friendModelDelete(_id) {
        try {
            const friendRequest = await FriendModel.findById(_id);

            if (!friendRequest) {
                throw new Error("Friend request not found");
            }

            friendRequest.status = 2;
            friendRequest.commit = "undo";
            await friendRequest.save();

            const isUndoEarly = (new Date() - friendRequest.createdAt) <= 60000;

            if (isUndoEarly) {
                return { friendRequest, operation: "delete" };
            }

            return friendRequest;

        } catch (error) {
            return error
        }
    }

    async friendModelUpdate(_id) {
        try {
            const accept = await FriendModel.findOneAndUpdate({ _id }, { $set: { status: 1, commit: "request accepted" } })

            return accept
        } catch (error) {
            return error
        }
    }

    async userFriends(user_id) {
        try {
            const friends = await FriendModel.find({
                $or: [
                    { user_id: user_id },
                    { request: user_id }
                ]
            }).populate({
                path: "user_id request",
                select: ["userName", "phoneNumber", "team", "_id", "profilePicture"]
            });
            return friends
        } catch (error) {
            return error
        }
    }

    async userFriendForCurrentPage(user_id, request) {
        try {
            const friends = await FriendModel.findOne({
                $or: [
                    { user_id: user_id, request: request },
                    { user_id: request, request: user_id }
                ]
            }).sort({ createdAt: -1 });

            const checkAccepter = friends?.user_id == user_id ? true : null

            return friends ? { status: friends?.status, _id: friends?._id, accepter: checkAccepter } : null;
        } catch (error) {
            console.log("here", error)
            return error;
        }
    }

    async messageModal(data) {
        try {
            const newMessage = new MessageModel({
                ...data
            })

            await newMessage.save();
            return newMessage
        } catch (error) {
            return error
        }

    }

    // conversation.service.js
    async conversationModal(senderId, recipientId, participants, subType) {
        try {
            let participantDoc = await Conversation.findOne(
                {
                    participants: {
                        $all: [
                            { $elemMatch: { entityId: senderId, entityType: 'User' } },
                            { $elemMatch: { entityId: recipientId, entityType: subType } }
                        ]
                    }
                }
            );
            if (!participantDoc) {
                // Create the participants doc
                participantDoc = await Conversation.create({
                    ...participants
                })
                await deleteConversationModal(participantDoc?._id)
            }

            return participantDoc;
        } catch (error) {
            throw error;
        }
    }

    async getUserContacts(userID) {
        try {
            const conversations = await Conversation.find({
                participants: {
                    $elemMatch: {
                        entityId: userID,
                        entityType: 'user'
                    }
                }
            }).sort({ updatedAt: -1 }); // optional: sort by latest
            return conversations;
        } catch (error) {
            throw error;
        }
    }

    async getUsersByIds(userIds) {
        try {
            const users = await UserModel.find({
                _id: { $in: userIds } // ✅ Correct way to use $in
            }).select(["userName", "phoneNumber", "_id", "profilePicture"]);
            return users;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();
