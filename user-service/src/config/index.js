require('dotenv').config();

const Config = {
    "HOST": process.env.HOST,
    "PORT": process.env.PORT,
    "USER_GRPC_PORT": process.env.USER_GRPC_PORT,
    "DATABASE": {
        URL: process.env.DATABASE_URL,
    },
    "JWTSECRETKEY": process.env.JWTACCESSKEY,
    "SECRETACCESSKEY": process.env.SECRETACCESSKEY,
    "ACESSKEYID": process.env.ACESSKEYID,
}

module.exports = Config