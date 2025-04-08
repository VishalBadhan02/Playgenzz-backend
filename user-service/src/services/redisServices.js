const { redis } = require('../clients/redisClient');

async function storeConversation(userId, recieverId, conversationId) {
    await redis.set(`conversation:${userId}:${recieverId}`, conversationId, 'EX', 60 * 60 * 24); // 1 day
}

const getConversation = async (userId, recieverId) => {
    const key = `conversation:${userId}:${recieverId}`;
    const conversation = await redis.get(key);

    if (conversation) {
        // Reheat: Extend expiry to 1 more day if it's being used
        await redis.expire(key, 60 * 60 * 24);
    }

    return conversation;
};

const deleteConversation = async (userId) => {
    await redis.del(`conversation:${userId}`);
}
const storeAccessToken = async (userId, token) => {
    await redis.set(`access:${userId}`, token, 'EX', 60 * 15); // 15 minutes
}

module.exports = {
    storeConversation,
    getConversation,
    deleteConversation,
    storeAccessToken
};