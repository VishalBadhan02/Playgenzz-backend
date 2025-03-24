const UserModel = require('../models/user');
const reply = require('../helper/reply');
const lang = require('../language/en');
const { generateToken } = require('../services/JWT');
const Lang = require('../language/en');
const { generateOTP, verifyOTP } = require('../helper/index')
const SendMail = require('../services/mail')
const Razorpay = require("razorpay")
const Bcrypt = require("bcryptjs")
const saltRounds = 16;
// const Config = require("../config/index")
// const { TeamModel } = require("../models/team");
const OTPModel = require('../models/otps');
const TempUserModel = require('../models/tempUser');

const login = async (req, res) => {
    const { password, email } = req.body;
    // console.log(req.body)
    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return (
                res.status(200).json(reply.failure(lang.LOGIN_NOTFOUND))
            )
        }
        const isMatch = await Bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json(reply.failure(lang.PASSWORD_NOTFOUND))
        }

        const module = await generateOTP(user._id, "otp for login");

        // await SendMail(user.email, "opt", "Otp for login " + module.otp);

        const token = generateToken(user);
        return (
            res.status(200).json(reply.success(Lang.LOGIN_SUCCESS, { token: token, type: req.body.type }))

        )
    }
    catch (err) {
        return res.json(reply.failure(err.message));
    }
}

const verifyUser = async (req, res) => {
    try {
        const tempUser = await TempUserModel.findOne({ _id: req.user._id })
        const email = tempUser.email
        const phoneNumber = tempUser.phoneNumber
        const address = tempUser.address
        const password = tempUser.password
        const firstName = tempUser.firstName
        const lastName = tempUser.lastName
        const userName = tempUser.userName

        const user = new UserModel({
            email,
            phoneNumber,
            address,
            password,
            firstName,
            lastName,
            userName,
            status: "Verified"

        })
        user.save();
        await TempUserModel.findOneAndDelete({ _id: req.user._id })
        const token = generateToken(user);
        return res.json(reply.success(lang.REGISTER_SUCCESFULLY, { token }))
    } catch (error) {
        return res.json(reply.failure(error.message));
    }
}

const Register = async (req, res) => {
    const {
        email,
        phoneNumber,
        address,
        password,
        firstName,
        lastName,
        userName
    } = req.body;
    console.log(req.body)
    const encypted_password = await Bcrypt.hash(password, saltRounds);

    try {
        const user = new TempUserModel({
            email,
            phoneNumber,
            address,
            password: encypted_password,
            firstName,
            lastName,
            userName,
            status: "Pending verification"
        })
        user.save();
        const module = await generateOTP(user._id, "registered by");
        // await SendMail(user.email, "opt", "your otp is " + module);
        const token = generateToken(user);
        return (
            res.json(reply.success(Lang.LOGIN_SUCCESS, { token }))
        )
    } catch (err) {
        return res.json(err)
    }
}

const handleteam = async (req, res) => {
    try {
        // const data = await TeamModel.findOne({ user_id: req.user._id })
        return res.json(data)
    } catch (error) {
        return res.json("error in team", error)
    }
}

const handleOTpverification = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("res.body")

        const isverified = await verifyOTP(req.user._id, otp);
        const check = await OTPModel.findOne({ userId: req.user._id })
        let count = 1;

        if (!isverified) {
            if (check.attempt) {
                let count = check.attempt;
                if (count === 4) {
                    const isverified = await TempUserModel.findOneAndDelete({ userId: req.user._id })
                    return res.json(reply.failure({ msg: lang.ACCOUNT_DELETED, attempt: 0 }))
                }
                count++
                await OTPModel.findOneAndUpdate({ userId: req.user._id }, { $set: { attempt: count } })
                return res.json(reply.failure({ msg: lang.WRONG_OTP, attempt: 3 }))
            }
            const isverified = await OTPModel.findOneAndUpdate({ userId: req.user._id }, { $set: { attempt: count } })
            return res.json(reply.failure({ msg: lang.WRONG_OTP, attempt: 3 - check.attempt }))
        }
        return res.json(reply.success(lang.OTP_VERIFIED, req.body.type))
    } catch (error) {
        return res.json("error in otp verification", error)

    }

}

const handleforgot = async (req, res) => {
    const value = req.body;
    const changepassword = await UserModel.findOne({ email: value })
    const module = await generateOTP(changepassword._id, "otp for forgottn password ");
    await SendMail(user.email, "opt", "your otp is " + module);
    return res.json(changepassword)

}

// const instance = new Razorpay({
//     key_id: Config.RAZORPAY.KEY_ID,
//     key_secret: Config.RAZORPAY.PRIVATE_KEY
// });

const createOrder = async (ammout, currency = "IND") => {
    const options = {
        ammount: ammout * 100,
        currency: currency,
        receipt: "order" + Date.now()
    }
}


module.exports = { login, Register, handleOTpverification, handleforgot, handleteam, verifyUser }