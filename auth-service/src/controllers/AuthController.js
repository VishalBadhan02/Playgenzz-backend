const reply = require('../helper/reply');
const lang = require('../language/en');
const { generateToken } = require('../services/JWT');
const Lang = require('../language/en');
const { generateOTP, verifyOTP, registerUser, ExistUser } = require('../helper/index')
const SendMail = require('../services/mail')
const Bcrypt = require("bcryptjs")
const saltRounds = 16;
// const Config = require("../config/index")
const prisma = require('../prisma/prisma');
const { getUser } = require('../client');

const login = async (req, res) => {
    const { password, emailOrPhone } = req.body;
    try {
        const Validation = await ExistUser(emailOrPhone)

        if (!Validation.status) {
            return (
                res.status(200).json(reply.failure(lang.LOGIN_NOTFOUND))
            )
        }

        const user = Validation.user

        const isMatch = await Bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json(reply.failure(lang.PASSWORD_NOTFOUND))
        }

        // const module = await generateOTP(user.id, "otp for login");

        const userService = await getUser(user.id)

        if (!userService.success) {
            return res.status(409).json(reply.failure(lang.PASSWORD_NOTFOUND))
        }

        // // await SendMail(user.email, "opt", "Otp for login " + module.otp);

        const token = generateToken(userService.response.user);
        if (!token) {
            return res.status(409).json(reply.failure(lang.PASSWORD_NOTFOUND))
        }
        return res.status(200).json(reply.success(Lang.LOGIN_SUCCESS, { token: token, type: req.body.type }))


    }
    catch (err) {
        return res.json(reply.failure(err.message));
    }
}

const Register = async (req, res) => {
    //Extract user data safely
    const { firstName, lastName, userName, email, phoneNumber, password, address, userType } = req.body;

    // Input Validation (Prevent Empty Fields)
    if (!firstName || !lastName || !email || !password || !address) {
        return res.status(400).json(reply.error("Missing required fields"));
    }

    // ✅ Check for existing user (Prevent Duplicate Accounts)
    const existingUser = await prisma.tempUser.findFirst({
        where: {
            OR: [{ email }, { phoneNumber }]
        }
    });

    if (existingUser) {
        return res.status(409).json(reply.failure("User already exists"));
    }

    // // ✅ Hash password securely
    const hashedPassword = await Bcrypt.hash(password, saltRounds);

    try {
        // ✅ Store user in TempUser table
        const user = await prisma.tempUser.create({
            data: {
                firstName,
                lastName,
                userName,
                email,
                phoneNumber,
                password: hashedPassword,
                address,
                status: "pending",
                userType: userType || "user", // Default to 'user'
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            }
        });

        if (!user) {
            return res.status(500).json(reply.failure("Failed to create user"));
        }

        // Generate OTP
        const module = await generateOTP(user.email, user.phoneNumber, user.id);

        console.log(module.otp)

        if (!module) {
            return res.status(500).json(reply.failure("Failed to generate OTP"));
        }
        // Send OTP via Email or SMS
        // await SendMail(user.email, "opt", "your otp is " + module);

        // Generate JWT Token
        const token = await generateToken({ id: user.id, email: user.email, userType: user.userType });
        if (!token) {
            return res.status(500).json(reply.failure("Failed to generate token"));
        }

        return (
            res.status(202).json(reply.success(Lang.LOGIN_SUCCESS, { token, email: user.email, phoneNumber: req.body.phoneNumber }))
        )
    } catch (err) {
        console.log(err)
        return res.status(500).json(reply.failure(err.message));
    }
}





const handleOTpverification = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!req.user._id) {
            return res.status(200).json(reply.failure("id not found"))
        }

        const isverified = await verifyOTP(req.user._id, otp);

        if (!isverified) {
            return res.json(reply.failure(lang.WRONG_OTP))
        }

        const registerUse = await registerUser(req.user._id);

        if (!registerUse.success) {
            return res.json(reply.failure(lang.REGISTER_FAILED))
        }

        return res.json(reply.success(lang.OTP_VERIFIED, { token: registerUse.token }))
    } catch (error) {
        console.log("Error occuring in the handleOTpverification", error.message)
        return res.json("error in otp verification", error)

    }

}



const handleforgot = async (req, res) => {
    const value = req.body;
    // const changepassword = await UserModel.findOne({ email: value })
    const module = await generateOTP(changepassword._id, "otp for forgottn password ");
    await SendMail(user.email, "opt", "your otp is " + module);
    return res.json(changepassword)

}




module.exports = { login, Register, handleOTpverification, handleforgot }