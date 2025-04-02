const messageControl = async (ws, data, wss) => {
    try {
        const { from, to, message, messageType, teamId, type } = data.data
        const user = await UserModel.findOne({ _id: from })
        if (!user) {
            console.log("user not found")
            return false;
        }
        if (!from || !message || !messageType) {
            console.error("Missing required fields");
            return false;
        }
        let status = 0
        if (wss.clients) {
            wss.clients.forEach(element => {
                if (element.userId == to) {
                    status = 2
                }
            });
        }

        const newMessage = new MessageModel({
            from: ws.userId,
            to,
            teamId,
            message,
            userName: user.userName,
            messageType,
            status
        })
        await newMessage.save();

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN &&
                ((client.userId === from || client.userId === to))) {
                client.send(JSON.stringify({
                    type: 'message_update',
                    newMessage
                }));
            }
        });

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