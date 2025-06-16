const userService = require("../services/userService");
const { getFriendStatusMap, mapUserListWithFriends } = require("./friends");

async function getSearchResults(sessionId, searchTerm) {
    // ✅ Fetch users excluding current user
    const users = await userService.findFriends(sessionId, searchTerm);

    // ✅ Fetch all friend requests related to user
    const friendRequests = await userService.friendRequests(sessionId);

    // ✅ Generate friend status map (existing utility)
    const friendStatusMap = getFriendStatusMap(friendRequests, sessionId);

    // ✅ Generate user list with status
    const userList = mapUserListWithFriends(users, friendStatusMap);

    // ✅ Extract check logic (exactly same as your current logic)
    const check = friendRequests.filter(request => request.request.toString() === sessionId.toString());

    return { userList, check };
}

module.exports = { getSearchResults }
