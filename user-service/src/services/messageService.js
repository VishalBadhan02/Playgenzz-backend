const Conversation = require("../models/conversationSchema");
const { MessageModel } = require("../models/messageModal");
const { getCacheMessages, setCacheMessages } = require("./redisServices");

class MessageService {
    constructor() { }

    // Get the last message in a conversation
    async getLastMessageForConversation(conversationId) {
        try {
            const message = await MessageModel.findOne({ conversationId }).sort({ updatedAt: -1 });
            return message;
        } catch (error) {
            throw error;
        }
    }

    async getLastMessagesForConversations(convoIds) {
        const docs = await MessageModel.find({
            conversationId: { $in: convoIds }
        })
            .sort({ updatedAt: -1 })
            .distinct('conversationId') // one per conversation
            .exec();

        // Or aggregate: $group by conversationId with $first
        return docs.reduce((map, msg) => {
            map[msg.conversationId.toString()] = msg;
            return map;
        }, {});
    }


    async getMessage(conversationId, page = 0, limit = 20) {
        try {
            const skipCount = page * limit;
            // 1. Try fetching from Redis cache
            const cachedMessages = await getCacheMessages(conversationId, page);
            if (cachedMessages) {
                return cachedMessages;
            }
            const messages = await MessageModel.find({ conversationId: conversationId })
                .sort({ updatedAt: 1 })  // Latest messages first
                .skip(skipCount)
                .limit(limit);

            await setCacheMessages(conversationId, page, messages)

            return messages;
        } catch (error) {
            throw error;
        }
    }

    
    async getUnreadCounts(convoIds, userId) {
        const docs = await MessageModel.aggregate([
            { $match: { conversationId: { $in: convoIds }, to: userId, read: false } },
            { $group: { _id: '$conversationId', count: { $sum: 1 } } },
        ]);
        return docs.reduce((map, obj) => {
            map[obj._id.toString()] = obj.count;
            return map;
        }, {});
    }

    // Get count of unread messages in a conversation
    async getUnReadCount(conversationId) {
        try {
            const count = await MessageModel.countDocuments({ conversationId, status: 0 });
            return count;
        } catch (error) {
            throw error;
        }
    }

    async checkConvo(userId, receiverId) {
        try {
            const convo = await Conversation.findOne({
                'participants.entityId': { $all: [userId, receiverId] }
            });
            return convo;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = new MessageService();
