const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { createUser, getUser, checkUniquenes, getUsersByIds, handleFriendModalUpdate } = require('../controllers/GrpcController');
const Config = require('../config');
const PROTO_PATH = path.resolve(__dirname, '../../../protos/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

mongoose.connect(Config.DATABASE.URL).then(() => console.log('✅ Grpc Service connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

function main() {
    const server = new grpc.Server(
        {
            'grpc.max_receive_message_length': 10 * 1024 * 1024,  // 10 MB
            'grpc.max_send_message_length': 10 * 1024 * 1024      // 10 MB
        }
    );

    server.addService(userProto.UserService.service, {
        CreateUser: createUser,
        GetUser: getUser,
        GetUserName: checkUniquenes,
        GetUserIds: getUsersByIds,
        GetModalId: handleFriendModalUpdate
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










