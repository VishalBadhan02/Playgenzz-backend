const { NotificationModel } = require("../models/notification");
const grpcClientService = require("./grpcClientService");
const util = require('util');


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

    async updateNotificationForStatus(_id, status, message, actionType) {
        try {
            const modal = await NotificationModel.findOne({ _id })
            if (!modal) {
                // Handle the case where no document is found
                return null; // or throw a specific error
            }
            const getFriendModalResponseAsync = util.promisify(grpcClientService.getFriendModalResponse);
            const grpcResponse = await getFriendModalResponseAsync(modal.entityId, actionType);
            if (!grpcResponse.isUnique) {
                return false
            }
            modal.status = status
            modal.message = message
            await modal.save()
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
