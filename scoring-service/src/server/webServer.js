const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const Config = require('../config'); // Ensure this has JWTSECRETKEY and SOCKET_PORT
const { default: mongoose } = require('mongoose');
const { ScoreUpdate } = require('../controllers/WebController');
const verifyJWT = require('../middleware/JWT');
const handleWebRouting = require('../routes/webSocket');

mongoose.connect(Config.DATABASE.URL || "mongodb://localhost:27017/user-db").then(() => console.log('✅ WebSocket Service connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

const server = http.createServer();

const wss = new WebSocket.Server({ server });



wss.on('connection', (ws, req) => {
    console.log('⛳️ New WebSocket Client Connected');

    const token = req.headers['sec-websocket-protocol'];

    if (!token) {
        console.log("❌ No token provided, closing connection.");
        ws.close();
        return;
    }

    try {
        const decoded = jwt.verify(token, Config.JWTSECRETKEY || "vishal123");
        // console.log("🔑 Authenticated user:", decoded);

        ws.user = decoded._id;
        ws.on('message', handleWebRouting);

        // Broadcast to all clients (optional)


    } catch (error) {
        console.log("❌ Invalid token:", error.message);
        ws.close();
        return;
    }

    ws.on('close', () => {
        console.log('❌ Client Disconnected');
    });
});

server.listen(Config.SOCKET_PORT, "0.0.0.0", () => {
    console.log(`🚀 WebSocket Server running on port ${Config.SOCKET_PORT || 5009}`);
});
