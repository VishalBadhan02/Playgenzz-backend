const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require('mongoose');
const { getTeamByUser } = require("./controllers/GrpcController")

// Load proto file
const PROTO_PATH = path.resolve(__dirname, "../../protos/team.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const teamProto = grpc.loadPackageDefinition(packageDefinition).team;

function loggingInterceptor(options, nextCall) {
    return new grpc.InterceptingCall(nextCall(options), {
        start: function (metadata, listener, next) {
            console.log(`Incoming request: ${options.method_definition.path}`);
            next(metadata, listener);
        },
    });
}


// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL).then(() => console.log('✅ Team Service connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));


// Start gRPC Server
const server = new grpc.Server({
    interceptors: [loggingInterceptor],
});
server.addService(teamProto.TeamService.service, { GetTeamByUser: getTeamByUser });

server.bindAsync("0.0.0.0:5006", grpc.ServerCredentials.createInsecure(), () => {
    console.log("🚀 Team-Service gRPC Server running on port 5006");
});
