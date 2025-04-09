const { NotificationModel } = require("../models/notification");

class NotificationService {
    constructor() { }

    // Get the last message in a conversation
    async setNotification(notification) {
        try {
            const noti = new NotificationModel({
                ...notification
            })
            await noti.save()
            if (!noti) {
                return false
            }
            return true
        } catch (error) {
            throw error;
        }
    }


    async deleteNotification(entityId) {
        try {
            const modal = await NotificationModel.findOneAndDelete({ entityId })
            if (!modal) {
                return "no modal found"
            }
            return modal
        } catch (error) {
            throw error;
        }
    }


    // Get count of unread messages in a conversation
    async getUnReadCount(conversationId) {
        try {

        } catch (error) {
            throw error;
        }
    }

    async checkConvo(userId, receiverId) {
        try {

        } catch (error) {
            throw error;
        }
    }


}

module.exports = new NotificationService();
