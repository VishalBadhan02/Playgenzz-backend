const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Config = require('../config');

// Define the path to the user.proto file
const VENUE_PROTO_PATH = path.join(__dirname, '../../../protos/user.proto');

// Load the user.proto file
const packageDefinition = protoLoader.loadSync(VENUE_PROTO_PATH);
const venueProto = grpc.loadPackageDefinition(packageDefinition).user;

// Create the gRPC client for the user service
const venueClient = new venueProto.UserService(
    `${Config.VENUE_GRPC_HOST}:${Config.VENUE_GRPC_PORT}`, // Address of the user service
    grpc.credentials.createInsecure()
);

module.exports = venueClient;
