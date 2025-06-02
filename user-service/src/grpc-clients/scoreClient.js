const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Config = require('../config');

// Define the path to the user.proto file
const SCORE_PROTO_PATH = path.join(__dirname, '../../../protos/user.proto');

// Load the user.proto file
const packageDefinition = protoLoader.loadSync(SCORE_PROTO_PATH);
const scoreProto = grpc.loadPackageDefinition(packageDefinition).user;

// Create the gRPC client for the user service
const scoreClient = new scoreProto.UserService(
    `${Config.SCORING_GRPC_HOST}:${Config.SCORING_GRPC_PORT}`, // Address of the user service
    grpc.credentials.createInsecure()
);

module.exports = scoreClient;
