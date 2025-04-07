const { MessageModel } = require("../models/messageModal");
const { getConversation, storeConversation } = require("../services/redisServices");
const userService = require("../services/userService");


const messageControl = async (ws, datat, wss) => {
    try {
        const { matchId, data } = datat;
        let status = 0;

        if (!ws.user || !data.message) {
            console.error("Missing required fields");
            return false;
        }

        // Try getting conversationId from Redis
        let conversationId = await getConversation(ws.user, matchId);

        if (!conversationId) {
            const participants = [
                { entityId: ws.user, entityType: 'User' },
                { entityId: matchId, entityType: 'User' }
            ];

            const conversation = await userService.conversationModal(ws.user, matchId, participants);
            conversationId = conversation._id.toString();

            // Store it in Redis for 1 day
            await storeConversation(ws.user, matchId, conversationId);
        }

        const modalData = {
            from: ws.user,
            to: matchId,
            message: data.message,
            sessionId: ws.user,
            status,
            conversationId
        };

        const messageData = await userService.messageModal(modalData);
        console.log("message data", messageData);

    } catch (err) {
        console.log({ msg: "error in backend" }, err);
    }
};



const statusControl = async (ws, data, wss) => {
    try {
        const isOffline = data.data.statusType === "offline"
        if (data.data.statusType === "offline") {
            await UserModel.findOneAndUpdate({ _id: ws.userId }, {
                $set: {
                    active: false
                }
            })

        } else {
            await MessageModel.updateMany(
                {
                    from: data.matchId,
                    to: ws.userId,
                    status: 0
                },
                {
                    $set: {
                        status: 1,
                    }
                }
            );
            await UserModel.findOneAndUpdate({ _id: ws.userId }, {
                $set: {
                    active: true
                }
            })
        }

        if (wss.clients) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN
                ) {
                    client.send(JSON.stringify({
                        type: 'message_update',
                        status: isOffline
                    }));
                }
            });
        }
        return
    } catch (error) {
        console.error('Error updating message statuses:', error);
    }


}



module.exports = {
    messageControl,
    statusControl
}
















// const messageControl = async (ws, datat, wss) => {
//     try {
//         const { matchId, data } = datat;

//         if (!ws.user || !data.message) {
//             console.error("Missing required fields");
//             return false;
//         }

//         const senderId = ws.user;
//         const recipientId = matchId;

//         // Check if the conversation is already cached in the WebSocket object


//         // Use the cached conversation for message storage
//         const newMessage = new Message({
//             conversationId: ws.conversation._id,
//             from: senderId,
//             to: recipientId,
//             message: data.message,
//             status: 0 // Assuming 0 indicates 'sent' status
//         });
//         await newMessage.save();

//         // Broadcast the message to relevant clients
//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN &&
//                 (client.user === senderId || client.user === recipientId)) {
//                 client.send(JSON.stringify({
//                     type: 'message_update',
//                     message: newMessage
//                 }));
//             }
//         });

//     } catch (err) {
//         console.error("Error in backend", err);
//     }
// };
