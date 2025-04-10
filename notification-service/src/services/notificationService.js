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
    async updateNotification(entityId, status, message) {
        try {
            const modal = await NotificationModel.findOneAndUpdate({ entityId }, {
                $set: {
                    status: status,
                    message: message
                }
            })
            return modal
        } catch (error) {
            throw error;
        }
    }

    async updateNotificationForStatus(_id, status, message) {
        try {
            const modal = await NotificationModel.findOneAndUpdate({ _id }, {
                $set: {
                    status: status,
                    message: message
                }
            })
            return modal
        } catch (error) {
            throw error;
        }
    }

    async fetchNotifications(receiverId) {
        try {
            const notifications = NotificationModel.find({ receiverId }).sort({ createdAt: -1 });
            return notifications
        } catch (error) {
            throw error;
        }
    }


}

module.exports = new NotificationService();
