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
        return res.json("error fetching friendrequest")
    }
}

const handleDeleteRequest = async (data) => {
    try {
        if (data.operation === "delete") {

        }
    } catch (error) {
        return res.json("error fetching friendrequest")
    }
}

module.exports = {
    handleFriendRequest,
    handleDeleteRequest
}