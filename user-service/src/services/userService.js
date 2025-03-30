const UserModel = require("../models/user");

class UserService {

    //find user
    async findUser(_id) {
        const user = await UserModel.findOne({ _id, status: "active" })
        if (!user) {
            return false
        }
        return user
    }
}

module.exports = new UserService();