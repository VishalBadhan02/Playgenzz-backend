const { FriendModel } = require("../models/useFriends");
const UserModel = require("../models/user");

class UserService {
    constructor() { }

    // Find user by ID (Ensuring Status is "Active")
    async findUser(_id) {
        const user = await UserModel.findOne({ _id, status: "active" });
        return user || false; // Return false if user not found
    }

    // Find Friends by Username Search
    async findFriends(_id, searchTerm) {
        const users = await UserModel.find({
            _id: { $ne: _id }, // Exclude the current user
            userName: { $regex: `^${searchTerm}`, $options: "i" }
        }).select("_id userName team profilePicture");

        return users; // Always returns an array (empty if no users found)
    }

    async friendRequests(session_id) {
        const friendRequests = await FriendModel.find({
            $or: [
                { user_id: session_id },
                { request: session_id }
            ]
        });

        return friendRequests; // Always returns an array (empty if no users found)
    }

    async updateProfile(_id, updateData) {
        const user = await UserModel.findOneAndUpdate({ _id }, { $set: updateData }, {
            new: true
        });
        return user
    }

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

    async friendModelUpdate(_id, status, commit) {
        try {
            const unFriend = new FriendModel.findOneAndUpdate({ _id }, { $set: { status: status, commit: commit } })
            return unFriend
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
}

module.exports = new UserService();
