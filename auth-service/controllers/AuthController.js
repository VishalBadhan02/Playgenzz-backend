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
const { default: pr } = require('../prisma/prisma')
const { PrismaClient } = require("@prisma/client");
const prisma = require('../prisma/prisma');

const login = async (req, res) => {
    const { password, email } = req.body;
    console.log(req.body)
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
    //Extract user data safely
    const { firstName, lastName, userName, email, phoneNumber, password, address, userType } = req.body;

    // Input Validation (Prevent Empty Fields)
    if (!firstName || !lastName || !email || !password || !address) {
        return res.status(400).json(reply.error("Missing required fields"));
    }
    console.log(req.body)
    return res.json(reply.success("success", { token: "token", email: req.body.email, phoneNumber: req.body.phoneNumber }))
    // ✅ Check for existing user (Prevent Duplicate Accounts)
    // const existingUser = await prisma.tempUser.findFirst({
    //     where: {
    //         OR: [{ email }, { phoneNumber }]
    //     }
    // });

    // if (existingUser) {
    //     return res.status(409).json(reply.failure("User already exists"));
    // }

    // // ✅ Hash password securely
    // const hashedPassword = await bcrypt.hash(password, saltRounds);


    // try {
    //     // ✅ Store user in TempUser table
    //     const user = await prisma.tempUser.create({
    //         data: {
    //             firstName,
    //             lastName,
    //             userName,
    //             email,
    //             phoneNumber,
    //             password: hashedPassword,
    //             address,
    //             status: "pending",
    //             userType: userType || "user", // Default to 'user'
    //             expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    //         }
    //     });

    //     if (!user) {
    //         return res.status(500).json(reply.failure("Failed to create user"));
    //     }

    //     // Generate OTP
    //     const module = await generateOTP(user.email, user.phoneNumber, user.id);

    //     if (!module) {
    //         return res.status(500).json(reply.failure("Failed to generate OTP"));
    //     }
    //     // Send OTP via Email or SMS
    //     // await SendMail(user.email, "opt", "your otp is " + module);

    //     // Generate JWT Token
    //     const token = await generateToken({ id: user.id, email: user.email, userType: user.userType });
    //     if (!token) {
    //         return res.status(500).json(reply.failure("Failed to generate token"));
    //     }

    //     return (
    //         res.status(202).json(reply.success(Lang.LOGIN_SUCCESS, { token, email: user.email, phoneNumber: req.body.phoneNumber }))
    //     )
    // } catch (err) {
    //     return res.status(500).json(reply.failure(err.message));
    // }
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