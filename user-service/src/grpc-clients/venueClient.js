const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Define the path to the user.proto file
const VENUE_PROTO_PATH = path.join(__dirname, '../../../protos/user.proto');

// Load the user.proto file
const packageDefinition = protoLoader.loadSync(VENUE_PROTO_PATH);
const venueProto = grpc.loadPackageDefinition(packageDefinition).user;

// Create the gRPC client for the user service
const venueClient = new venueProto.UserService(
    'localhost:50051', // Address of the user service
    grpc.credentials.createInsecure()
);

module.exports = venueClient;
