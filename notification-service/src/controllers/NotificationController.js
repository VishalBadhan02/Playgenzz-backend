const reply = require('../helper/reply');
const Lang = require("../language/en");
const grpcClientService = require('../services/grpcClientService');
const notificationService = require('../services/notificationService');
const { storeNotifications, getNotifications, deleteNotifications } = require('../services/redisServices');
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
        const id = req.body._id
        const actionType = req.body.action
        const dat = await notificationService.updateNotificationForStatus(id, 1, Lang.APPROVER_SIDE_USER_REQUEST, actionType)
        if (!dat) {
            return res.status(400).json(reply.failure())
        }


        const acknoledgement = {
            receiverId: dat.actorId,
            actorId: dat.receiverId,
            type: "user",
            entityId: dat.entityId,
            message: Lang.SENDER_SIDE_USER_REQUEST,
            status: 1,
            data: {
                name: req.user.userName,
                type: "friend_request"
            },
        }
        const sjdn = await notificationService.setNotification(acknoledgement)

        await deleteNotifications(`user:${req.user._id}:notifications`)
        return res.status(202).json(reply.success())
    } catch (error) {

    }
}


module.exports = {
    getFriendRequest, handleRequest
}