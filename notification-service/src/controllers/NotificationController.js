const reply = require('../helper/reply');
const Lang = require("../language/en");
const notificationService = require('../services/notificationService');
const { groupNotificationsByType } = require('../utils /groupNotificationsBytype');


const getFriendRequest = async (req, res) => {
    try {

        const user_id = req.user._id

        const notifications = await notificationService.fetchNotifications(user_id);

        const groups = await groupNotificationsByType(notifications)

        console.log(groups)

        return res.status(202).json(reply.success(Lang.FRIEND_REQUEST_FETCHED, groups))
    } catch (error) {
        return res.json("error fetching friendrequest")
    }
}

module.exports = {
    getFriendRequest
}