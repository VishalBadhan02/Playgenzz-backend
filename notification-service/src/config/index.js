require('dotenv').config();

const Config = {
    // General configuration
    "HOST": process.env.HOST,
    "PORT": process.env.PORT,
    "GRPC_PORT": process.env.GRPC_PORT,
    "GRPC_HOST": process.env.GRPC_HOST,
    "WEB_SOCKET_PORT": process.env.WEB_SOCKET_PORT,
    "WEB_SOCKET_HOST": process.env.WEB_SOCKET_HOST,
    "ACESSKEYID": process.env.ACESSKEYID,
    "JWTSECRETKEY": process.env.JWTACCESSKEY,
    "SECRETACCESSKEY": process.env.SECRETACCESSKEY,
    "DATABASE": {
        URL: process.env.DATABASE_URL,
    },


    // gRPC configuration
    "USER_GRPC_PORT": process.env.USER_GRPC_PORT,
    "USER_GRPC_HOST": process.env.USER_GRPC_HOST,
    "TEAM_GRPC_PORT": process.env.TEAM_GRPC_PORT,
    "TEAM_GRPC_HOST": process.env.TEAM_GRPC_HOST,
    "SCORING_GRPC_PORT": process.env.SCORING_GRPC_PORT,
    "SCORING_GRPC_HOST": process.env.SCORING_GRPC_HOST,
    "VENUE_GRPC_PORT": process.env.VENUE_GRPC_PORT,
    "VENUE_GRPC_HOST": process.env.VENUE_GRPC_HOST,
    "TOURNAMENT_GRPC_PORT": process.env.TOURNAMENT_GRPC_PORT,
    "TOURNAMENT_GRPC_HOST": process.env.TOURNAMENT_GRPC_HOST,
    "NOTIFICATION_GRPC_PORT": process.env.NOTIFICATION_GRPC_PORT,
    "NOTIFICATION_GRPC_HOST": process.env.NOTIFICATION_GRPC_HOST,


    // Redis configuration
    "REDIS_PORT": process.env.REDIS_PORT,
    "REDIS_HOST": process.env.REDIS_HOST,


    //KAFKA configuration
    "KAFKA_BROKERS": process.env.KAFKA_BROKER,
    "KAFKA_CLIENT_ID": process.env.KAFKA_CLIENT_ID,
}

module.exports = Config