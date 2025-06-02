const path = require('path');
const grpc = require("@grpc/grpc-js");
const protoLoader = require('@grpc/proto-loader');
const Config = require('../config');

const PROTO_PATH = path.resolve(__dirname, '../../../protos/team.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const teamProto = grpc.loadPackageDefinition(packageDefinition).team;


const teamClient = new teamProto.TeamService(
    `${Config.TEAM_GRPC_HOST}:${Config.TEAM_GRPC_PORT}`,
    grpc.credentials.createInsecure()
);


module.exports = { teamClient }

