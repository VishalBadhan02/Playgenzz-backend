// utils/friends.js

/**
 * Creates a mapping of friend statuses from friend request data
 * @param {Array} friendRequests - List of friend requests
 * @param {String} session_id - ID of the current user
 * @returns {Object} - Friend status mapping
 */
const getFriendStatusMap = (friendRequests, sessionId) => {
    const map = {};

    for (const req of friendRequests) {
        const isSent = req.user_id.toString() === sessionId.toString();

        // key = ID of the *other* user
        const key = isSent ? req.request.toString() : req.user_id.toString();

        map[key] = {
            modalId: req._id,
            status: req.status, // 0 = pending, 1 = accepted
            direction: isSent ? 'sent' : 'received',
        };
    }

    return map;
};

/**
 * Maps user data and attaches friend status
 * @param {Array} users - List of users
 * @param {Object} friendStatusMap - Friend status mapping
 * @returns {Array} - Processed list of users
 */
const mapUserListWithFriends = (users, friendStatusMap) => {
    return users.map(user => {
        const statusEntry = friendStatusMap[user._id];
        // console.log(statusEntry)

        if (!statusEntry) {
            return {
                ...user,
                status: 'none', // no request, not friends
                requestId: null
            };
        }

        if (statusEntry.status === 1) {
            return {
                ...user,
                status: 'friends', // request accepted
                requestId: statusEntry.modalId,
            };
        }

        return {
            ...user,
            status: statusEntry.direction, // 'sent' or 'received'
            requestId: statusEntry.modalId,
        };
    });
};

module.exports = { getFriendStatusMap, mapUserListWithFriends };
