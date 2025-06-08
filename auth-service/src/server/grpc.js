const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { updateUserInfo } = require('../controllers/GrpcController');
const Config = require('../config');
const { PrismaClient } = require('@prisma/client');
const PROTO_PATH = path.resolve(__dirname, '../../../protos/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Check Database Connection
async function connectDB() {
    try {
        await prisma.$connect();
        console.log("✅ grpc Service connected to PostgreSQL using Prisma");
    } catch (error) {
        console.error("❌ DB Connection Error:", error);
        process.exit(1);
    }
}
connectDB();

function main() {
    const server = new grpc.Server(
        {
            'grpc.max_receive_message_length': 10 * 1024 * 1024,  // 10 MB
            'grpc.max_send_message_length': 10 * 1024 * 1024      // 10 MB
        }
    );

    server.addService(authProto.AuthService.service, {
        UpdateUserInfo: updateUserInfo,

    });

    const GRPC_PORT = Config.GRPC_PORT;

    server.bindAsync(`${Config.GRPC_HOST}:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.log(`Starting gRPC serv er on port ${GRPC_PORT}...`);
            console.log(`gRPC Host: ${Config.GRPC_HOST}`);
            console.error(`❌ Server binding failed: ${err}`);
            return;
        }
        console.log(`🚀 User gRPC Server is running on port ${port}`);
    });
}

main();










