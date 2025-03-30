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
}

module.exports = new UserService();
