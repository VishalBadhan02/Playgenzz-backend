const { redis } = require('../clients/redisClient');

async function storeConversation(conversationId, data) {
    await redis.set(`conversation:${conversationId}`, JSON.stringify(data), 'EX', 60 * 60 * 24); // 1 day
}

const getConversation = async (cacheKey) => {
    const key = `conversation:${cacheKey}`;
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

async function storeConversationModal(key, ConversationModalData) {
    await redis.set(`ConversationModal:${key}`, JSON.stringify(ConversationModalData), 'EX', 60 * 60 * 24); // 1 day
}

const getConversationModal = async (cacheKey) => {
    const key = `ConversationModal:${cacheKey}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

const deleteConversationModal = async (cacheKey) => {
    await redis.del(`ConversationModal:${cacheKey}`);
}

const storeProfileData = async (cacheKey, profileData) => {
    await redis.set(`profileData:${cacheKey}`, JSON.stringify(profileData), 'EX', 600);
}

const getProfileData = async (cacheKey) => {
    const key = `profileData:${cacheKey}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
}

const deleteProfileData = async (cacheKey) => {
    await redis.del(`profileData:${cacheKey}`);
}

const setCacheMessages = async (conversationId, page, data) => {
    const redisKey = `conversation:${conversationId}:messages:page:${page}`;
    const pageSetKey = `conversation:${conversationId}:cachedPages`;

    await redis.set(redisKey, JSON.stringify(data), 'EX', 600)
    await redis.sadd(pageSetKey, page);
}

const getCacheMessages = async (conversationId, page) => {
    const redisKey = `conversation:${conversationId}:messages:page:${page}`;
    const message = await redis.get(redisKey)
    return message ? JSON.parse(message) : null;
}

const deleteMessages = async (conversationId, page) => {
    const redisKey = `conversation:${conversationId}:messages:page:${page}`;
    const pageSetKey = `conversation:${conversationId}:cachedPages`;

    await redis.del(redisKey);
    await redis.srem(pageSetKey, page); // 👈 remove that page from tracking set
}

const deleteAllCachedMessages = async (conversationId) => {
    const pageSetKey = `conversation:${conversationId}:cachedPages`;

    const pages = await redis.smembers(pageSetKey); // 👈 get tracked pages

    if (pages.length > 0) {
        const deletePromises = pages.map((page) =>
            redis.del(`conversation:${conversationId}:messages:page:${page}`)
        );
        await Promise.all(deletePromises);
    }

    await redis.del(pageSetKey); // 👈 delete the tracking set itself
}


module.exports = {
    storeConversation,
    getConversation,
    deleteConversation,
    storeAccessToken,
    storeConversationModal,
    getConversationModal,
    deleteConversationModal,
    storeProfileData,
    getProfileData,
    deleteProfileData,
    setCacheMessages,
    getCacheMessages,
    deleteMessages,
    deleteAllCachedMessages
};