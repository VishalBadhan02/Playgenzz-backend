const reply = require('../helper/reply');
const Lang = require("../language/en");
const { NotificationModel } = require("../models/notification");


const getFriendRequest = async (req, res) => {
    try {
        const user_id = req.user._id
        const friends = await NotificationModel.find({ user_id }).sort({ createdAt: -1 });
        return res.json(reply.success(Lang.FRIEND_REQUEST_FETCHED, friends))
    } catch (error) {
        return res.json("error fetching friendrequest")
    }
}

module.exports = {
    getFriendRequest
}