const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { getTeamByUser } = require("./controllers/GrpcController");
const mongoose = require('mongoose');

// Load proto file
const PROTO_PATH = path.resolve(__dirname, "../../protos/team.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const teamProto = grpc.loadPackageDefinition(packageDefinition).team;


// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL).then(() => console.log('✅ Team Service connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));



// Start gRPC Server
const server = new grpc.Server();
server.addService(teamProto.TeamService.service, { GetTeamByUser: getTeamByUser });

server.bindAsync("0.0.0.0:5006", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Team-Service gRPC Server running on port 5006");
});
