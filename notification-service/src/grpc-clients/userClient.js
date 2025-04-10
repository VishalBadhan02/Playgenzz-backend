const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Config = require('../config');

// Define the path to the user.proto file
const USER_PROTO_PATH = path.resolve(__dirname, '../../../protos/user.proto');;

// Load the user.proto file
const packageDefinition = protoLoader.loadSync(USER_PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Create the gRPC client for the user service
const userClient = new userProto.UserService(
    `${Config.USER_GRPC_HOST}:${Config.USER_GRPC_PORT}`, // Address of the user service
    grpc.credentials.createInsecure()
);

module.exports = userClient;
