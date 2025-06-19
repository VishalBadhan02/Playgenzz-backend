const messageService = require("../services/messageService");
const userService = require("../services/userService");


// async function getParticipantsWithDetails(conversations, currentUserId) {
//     const grouped = {};
//     const allParticipants = [];

//     for (const convo of conversations) {
//         const plainConvo = convo.toObject ? convo.toObject() : convo;
//         const convoId = plainConvo._id;

//         const others = plainConvo.participants.filter(p => p.entityId !== currentUserId);

//         for (const p of others) {
//             if (!grouped[p.entityType]) grouped[p.entityType] = [];
//             grouped[p.entityType].push(p.entityId);

//             allParticipants.push({
//                 ...p,
//                 convoId
//             });
//         }
//     }

//     const results = {};
//     if (grouped.user) {
//         results.User = await userService.getUsersByIds(grouped.user);
//     }

//     const enrichedParticipants = await Promise.all(
//         allParticipants.map(async (p) => {
//             const entityTypeCapitalized = p.entityType.charAt(0).toUpperCase() + p.entityType.slice(1);
//             const found = results[entityTypeCapitalized]?.find(e => e._id.toString() === p.entityId);

//             // Fetch dynamic data
//             const lastMessageDoc = await messageService.getLastMessageForConversation(p.convoId);
//             const unreadCount = await messageService.getUnReadCount(p.convoId);

//             return {
//                 _id: p.convoId,
//                 userId: p.entityId,
//                 type: p.entityType,
//                 status: lastMessageDoc?.status,
//                 lastMessage: lastMessageDoc?.message || null,
//                 lastMessageTime: lastMessageDoc?.updatedAt || null,
//                 unreadCount: unreadCount || 0,
//                 name: found?.userName || 'Unknown',
//                 avatar: found?.profilePicture || null
//             };
//         })
//     );

//     return enrichedParticipants;
// }

async function getParticipantsWithDetails(conversations, currentUserId) {
    const allParticipants = [];
    const convoIds = conversations.map(c => c._id.toString());

    for (const convo of conversations) {
        const others = convo.participants.filter(p => p.entityId !== currentUserId);
        for (const p of others) allParticipants.push({ convoId: convo._id.toString(), p });
    }

    const lastMessages = await messageService.getLastMessagesForConversations(convoIds);
    const unreadCounts = await messageService.getUnreadCounts(convoIds, currentUserId);

    return allParticipants.map(({ convoId, p }) => {
        const user = p;
        const lastMessage = lastMessages[convoId]?.message || null;
        const lastMessageStatus = lastMessages[convoId]?.status;
        const unreadCount = unreadCounts[convoId] || 0;

        return {
            _id: convoId,
            userId: user.entityId,
            type: user.entityType,
            status: lastMessageStatus,
            lastMessage,
            lastMessageTime: lastMessages[convoId]?.updatedAt || null,
            unreadCount,
            name: p.name, // assume populated or fetched earlier
            avatar: p.profilePicture,
        };
    });
}







module.exports = {
    getParticipantsWithDetails
}




// if (grouped.Team) {
//     results.Team = await teamService.getTeamsByIds(grouped.Team);
// }

// if (grouped.Organizer) {
//     results.Organizer = await tournamentService.getOrganizersByIds(grouped.Organizer);
// }

// if (grouped.VenueAdmin) {
//     results.VenueAdmin = await venueService.getVenueAdminsByIds(grouped.VenueAdmin);
// }