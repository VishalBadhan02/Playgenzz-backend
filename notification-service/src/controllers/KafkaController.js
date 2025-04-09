const reply = require('../helper/reply');
const Lang = require("../language/en");
const notificationService = require('../services/notificationService');


const handleFriendRequest = async (data) => {
    try {
        const notification = await notificationService.setNotification(data)
        if (!notification) {
            return false
        }
        return true
    } catch (error) {
        return error
    }
}

const handleDeleteRequest = async (data) => {
    try {
        if (data?.operation === "delete") {
            await notificationService.deleteNotification(data?.entityId)
            return
        }
        await notificationService.updateNotification(data?.entityId, 3, Lang.CANCEL_REQUEST)
        return
    } catch (error) {
        return error
    }
}

const handleApproveRequest = async () => {
    try {
        await notificationService.updateNotification(data?.entityId, 1, Lang.APPROVER_SIDE_USER_REQUEST)

    } catch (error) {

    }
}

module.exports = {
    handleFriendRequest,
    handleDeleteRequest,
    handleApproveRequest
}