require('dotenv').config();

const Config = {
    "HOST": process.env.HOST,
    "PORT": process.env.PORT,
    "REDIS_PORT": process.env.REDIS_PORT,
    "REDIS_HOST": process.env.REDIS_HOST,
    "JWTSECRETKEY": process.env.JWTACCESSKEY,
}

module.exports = Config