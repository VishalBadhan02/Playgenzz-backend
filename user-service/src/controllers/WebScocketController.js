const { MessageModel } = require("../models/messageModal");
const userService = require("../services/userService");

const messageControl = async (ws, datat, wss) => {
    try {
        // const { from, to, message, messageType, teamId, type } = 
        const { matchId, data } = datat
        let status = 0;

        if (!ws.user || !data.message) {
            console.error("Missing required fields");
            return false;
        }

        const modalData = {
            from: ws.user,
            to: matchId,
            message: data.message,
            sessionId: ws.user,
            status: status,
        }

        const messageData = await userService.messageModal(modalData)

        // if (!user) {
        //     console.log("user not found")
        //     return false;
        // }

        // let status = 0
        // if (wss.clients) {
        //     wss.clients.forEach(element => {
        //         if (element.userId == to) {
        //             status = 2
        //         }
        //     });
        // }

        // const newMessage = new MessageModel({
        //     from: ws.userId,
        //     to,
        //     teamId,
        //     message,
        //     userName: user.userName,
        //     messageType,
        //     status
        // })
        // await newMessage.save();

        // wss.clients.forEach(client => {
        //     if (client.readyState === WebSocket.OPEN &&
        //         ((client.userId === from || client.userId === to))) {
        //         client.send(JSON.stringify({
        //             type: 'message_update',
        //             newMessage
        //         }));
        //     }
        // });

    } catch (err) {
        console.log({ msg: "error in backend" }, err)
    }
}

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
//         if (!ws.conversation) {
//             // Define the participants array
//             const participants = [
//                 { entityId: senderId, entityType: 'User' },
//                 { entityId: recipientId, entityType: 'User' }
//             ];

//             // Retrieve or create the conversation and cache it in the WebSocket object
//             ws.conversation = await Conversation.findOneAndUpdate(
//                 {
//                     participants: {
//                         $all: [
//                             { $elemMatch: { entityId: senderId, entityType: 'User' } },
//                             { $elemMatch: { entityId: recipientId, entityType: 'User' } }
//                         ]
//                     }
//                 },
//                 {
//                     $setOnInsert: {
//                         participants: participants,
//                         type: 'one-on-one'
//                     }
//                 },
//                 {
//                     new: true,
//                     upsert: true
//                 }
//             );
//         }

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
