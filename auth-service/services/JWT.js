const jwt = require('jsonwebtoken');
// const Config = require('../config/index')
const Config = {
    JWTSECRETKEY:"vishal123"
}


const generateToken = (user) => {
    const token = jwt.sign(user.toObject(), Config.JWTSECRETKEY)
    return token;
}

const verifyJWT = (req, res, next) => {
    const token = req?.headers?.authorization;
    if (!token) {
        return res.json({ status: false, msg: "Token not verified" })
    }

    const decoded = jwt.verify(token, Config.JWTSECRETKEY);
    if (!decoded) {
        return res.json({ status: false, msg: "token wrong or expired" })
    }

    req.user = decoded;
    next();

}

module.exports = {
    generateToken, verifyJWT
}

