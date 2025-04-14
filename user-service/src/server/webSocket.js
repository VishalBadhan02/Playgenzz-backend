const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const Config = require('../config'); // Ensure this has JWTSECRETKEY and SOCKET_PORT
const { messageControl } = require('../controllers/WebScocketController');
const { default: mongoose } = require('mongoose');

mongoose.connect(Config.DATABASE.URL || "mongodb://localhost:27017/user-db").then(() => console.log('✅ WebSocket Service connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

const server = http.createServer();

const wss = new WebSocket.Server({ server });



wss.on('connection', (ws, req) => {
    console.log('✅ New WebSocket Client Connected');

    // Extract token from headers
    const token = req.headers['sec-websocket-protocol'];

    if (!token) {
        console.log("❌ No token provided, closing connection.");
        ws.close();
        return;
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, Config.JWTSECRETKEY || "vishal123");
        // console.log("🔑 Authenticated user:", decoded);

        ws.user = decoded._id; // Attach user data to WebSocket instance

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                // console.log(data)
                if (data.type === "USER") {
                    await messageControl(ws, data, wss);
                }

                // Broadcast to all clients (optional)
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });

            } catch (error) {
                console.error("⚠️ Error processing WebSocket message:", error.message);
            }
        });

    } catch (error) {
        console.log("❌ Invalid token:", error.message);
        ws.close();
        return;
    }

    ws.on('close', () => {
        console.log('❌ Client Disconnected');
    });
});

server.listen(5060, "0.0.0.0", () => {
    console.log(`🚀 WebSocket Server running on port ${Config.SOCKET_PORT || 5060}`);
});
