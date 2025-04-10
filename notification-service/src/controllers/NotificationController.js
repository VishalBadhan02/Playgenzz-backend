const reply = require('../helper/reply');
const Lang = require("../language/en");
const notificationService = require('../services/notificationService');
const { dataGathering } = require('../utils /dataGatheringFromServices');
const { enrichNotifications } = require('../utils /enrichNotifications');
const { groupNotificationsByType } = require('../utils /groupNotificationsBytype');


const getFriendRequest = async (req, res) => {
    try {

        const user_id = req.user._id

        const notifications = await notificationService.fetchNotifications(user_id);

        const groups = await groupNotificationsByType(notifications)

        const finalResponse = await dataGathering(groups)

        const enrichedNotification = await enrichNotifications(notifications, finalResponse)

        return res.status(202).json(reply.success(Lang.NOTIFICATIONS_FETCHED, enrichedNotification))
    } catch (error) {
        return res.json("error fetching friendrequest")
    }
}

module.exports = {
    getFriendRequest
}