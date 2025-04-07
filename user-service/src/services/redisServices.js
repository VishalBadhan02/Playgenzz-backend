const { redisClient } = require('../clients/redisClient');

async function storeConversation(userId, recieverId, conversationId) {
    await redis.set(`conversation:${userId}:${recieverId}`, conversationId, 'EX', 60 * 60 * 24); // 1 day
}

const getConversation = async (userId, recieverId) => {
    const conversation = await redisClient.get(`conversation:${userId}:${recieverId}`);
    return conversation;
}
const deleteConversation = async (userId) => {
    await redisClient.del(`conversation:${userId}`);
}
const storeAccessToken = async (userId, token) => {
    await redisClient.set(`access:${userId}`, token, 'EX', 60 * 15); // 15 minutes
}

module.exports = {
    storeConversation,
    getConversation,
    deleteConversation,
    storeAccessToken
};