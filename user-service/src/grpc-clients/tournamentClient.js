const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Config = require('../config');

// Define the path to the user.proto file
const TOURNAMENT_PROTO_PATH = path.resolve(__dirname, '../../../protos/tournament.proto');;

// Load the user.proto file
const packageDefinition = protoLoader.loadSync(TOURNAMENT_PROTO_PATH);
const tournamentProto = grpc.loadPackageDefinition(packageDefinition).tournament;

// Create the gRPC client for the user service
const tournamentClient = new tournamentProto.TournamentService(
    `${Config.TOURNAMENT_GRPC_HOST}:${Config.TOURNAMENT_GRPC_PORT}`, // Address of the user service
    grpc.credentials.createInsecure()
);

module.exports = tournamentClient;
