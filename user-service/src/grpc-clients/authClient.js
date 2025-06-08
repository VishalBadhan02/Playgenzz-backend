const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Config = require('../config');

// Define the path to the user.proto file
const AUTH_PROTO_PATH = path.join(__dirname, '../../../protos/auth.proto');

// Load the user.proto file
const packageDefinition = protoLoader.loadSync(AUTH_PROTO_PATH);
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Create the gRPC client for the user service
const authClient = new authProto.UserService(
    `${Config.AUTH_GRPC_HOST}:${Config.AUTH_GRPC_PORT}`, // Address of the user service
    grpc.credentials.createInsecure()
);

module.exports = authClient;
