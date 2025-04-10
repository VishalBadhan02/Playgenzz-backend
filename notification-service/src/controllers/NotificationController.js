const reply = require('../helper/reply');
const Lang = require("../language/en");
const notificationService = require('../services/notificationService');
const { storeNotifications, getNotifications } = require('../services/redisServices');
const { dataGathering } = require('../utils /dataGatheringFromServices');
const { enrichNotifications } = require('../utils /enrichNotifications');
const { groupNotificationsByType } = require('../utils /groupNotificationsBytype');


const getFriendRequest = async (req, res) => {
    try {

        const user_id = req.user._id

        const cacheKey = `user:${user_id}:notifications`;

        const cachedData = await getNotifications(cacheKey)

        if (cachedData) {
            return res.status(200).json(reply.success("Fetched from cache", JSON.parse(cachedData)));
        }

        const notifications = await notificationService.fetchNotifications(user_id);

        const groups = await groupNotificationsByType(notifications)

        const finalResponse = await dataGathering(groups)

        const enrichedNotification = await enrichNotifications(notifications, finalResponse)

        // 3. Set in cache (expire in 60 seconds or whatever suits you)
        await storeNotifications(cacheKey, enrichedNotification);

        return res.status(200).json(reply.success(Lang.NOTIFICATIONS_FETCHED, enrichedNotification))
    } catch (error) {
        return res.json("error fetching friendrequest")
    }
}

const handleRequest = async (req, res) => {
    try {
        console.log("nsd", req.body)
    } catch (error) {

    }
}


module.exports = {
    getFriendRequest, handleRequest
}