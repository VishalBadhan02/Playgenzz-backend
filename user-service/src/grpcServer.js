const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { createUser, getUser } = require('./controllers/GrpcController');
const PROTO_PATH = path.resolve(__dirname, '../../protos/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

mongoose.connect(process.env.DATABASE_URL).then(() => console.log('✅ User Service connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

function main() {
    const server = new grpc.Server();

    server.addService(userProto.UserService.service, {
        CreateUser: createUser,
        GetUser: getUser,
    });

    const GRPC_PORT = process.env.GRPC_PORT || '5002';
    server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(`❌ Server binding failed: ${err.message}`);
            return;
        }
        console.log(`🚀 gRPC Server is running on port ${port}`);
    });
}

main();










