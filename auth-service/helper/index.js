const UserModel = require("../models/user")
const OTPModel = require("../models/otps")
const moment = require("moment")
// const reply = require('./reply');
// const lang = require('../language/en');

// const ExistUser = async (email) => {
//     if (await type === "mobile") {
//         const check = await UserModel.findOne({ email })
//         return (check) ? true : false;
//     }
//     const check = await UserModel.findOne({ email: typeValue })
//     return (check) ? true : false;
// }

const generateOTP = async (userId, comment) => {
    const oneTimePassword = Math.floor(Math.random(0) * (10000 - 999 + 1) + 999);
    const setoneTimePassword = oneTimePassword.toString();

    const OTPModule = new OTPModel();
    OTPModule.userId = userId;
    OTPModule.otp = setoneTimePassword;
    OTPModule.comment = comment;
    OTPModule.expiredate = moment(new Date()).add(10, 'minutes').toDate();
    OTPModule.save()
    return OTPModule;
}

const verifyOTP = async (userId, otp) => {
    const OTPRecord = await OTPModel.findOne({ userId: userId }).sort({ "createdAt": "desc" });
    if (OTPRecord.otp === otp) {
        return { status: true, msg: "otp verified successfully" }
    }
    if (!OTPRecord) {
        return { status: false, msg: "otp not found" }
    }

}

const handleUpdate = (user_id, value) => {
    const dd = new UserModel.updateOne(user_id, value);
}

module.exports = { generateOTP, verifyOTP }