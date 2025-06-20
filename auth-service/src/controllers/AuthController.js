const reply = require('../helper/reply');
const lang = require('../language/en');
const { generateToken } = require('../middlewares/JWT');
const Lang = require('../language/en');
const { generateOTP, verifyOTP, registerUser, ExistUser, handleExistingTempUser } = require('../helper/index')
const SendMail = require('../providers/mail')
const Bcrypt = require("bcryptjs")
const saltRounds = 16;
const prisma = require('../../prisma/prisma');
const { getRefreshToken, storeRefreshToken } = require("../services/redisTokenService");
const authService = require('../services/authService');

const login = async (req, res) => {
    const { password, emailOrPhone } = req.body;

    try {
        let data;

        if (emailOrPhone.includes('@')) {
            data = { type: 'email', message: lang.LOGIN_NOTFOUND };
        } else if (/^[6-9]\d{9}$/.test(emailOrPhone)) {
            data = { type: 'phoneNumber', message: lang.INCORRECT_NUMBER };
        } else {
            data = { type: 'userName', message: lang.USERNAME_NOTFOUND || "Username not found" };
        }

        let userInput = {};
        if (emailOrPhone.includes("@")) {
            userInput.email = emailOrPhone;
        } else if (/^[6-9]\d{9}$/.test(emailOrPhone)) {
            userInput.phoneNumber = emailOrPhone;
        } else {
            userInput.userName = emailOrPhone;
        }
        const Validation = await ExistUser(userInput);


        if (!Validation) {
            return res.status(404).json(reply.failure(data));
        }

        const user = Validation;

        const isMatch = await Bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(404)
                .json(reply.failure({ type: "password", message: lang.PASSWORD_NOTFOUND }));
        }

        // ✅ Check if refresh token already exists
        const existingRefreshToken = await getRefreshToken(user.id);

        let refreshToken;

        if (existingRefreshToken) {
            // Optionally, you can verify if the token is still valid (if using JWT)
            refreshToken = existingRefreshToken;

            // 🔁 Optional: Replace old token with new one
            refreshToken = generateToken({ ...user, authToken: true }); // Uncomment this if you want to always issue a new token
            await storeRefreshToken(user.id, refreshToken);
        } else {
            refreshToken = generateToken({ ...user, authToken: true }); // JWT or any method
            storeRefreshToken(user.id, refreshToken);
        }

        return res
            .status(200)
            .json(reply.success(lang.LOGIN_SUCCESS, { token: refreshToken, type: req.body.type }));

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json(reply.failure(err.message));
    }
};

const Register = async (req, res) => {
    //Extract user data safely
    const { firstName, lastName, userName, email, phoneNumber, password, address, userType } = req.body;

    // Input Validation (Prevent Empty Fields)
    if (!firstName || !lastName || !email || !password || !address || !userName) {
        return res.status(400).json(reply.error(lang.MISSING_FIELDS));
    }

    const validationCheckData = {
        email,
        phoneNumber,
        userName
    }


    const existingUser = await ExistUser(validationCheckData)

    // console.log("Existing User", existingUser)

    if (existingUser) {
        const field =
            existingUser.name === userName ? 'userName' :
                existingUser.email === email ? 'email' :
                    'phone';

        return res.status(409).json(reply.failure({ type: field, message: `${field} already exists` }));
    }

    const existingTemp = await authService.existingTempUser(validationCheckData);

    if (existingTemp) {
        // If a temporary user already exists, handle it
        const shouldAbort = await handleExistingTempUser(existingTemp, userName, email, phoneNumber, res);
        if (shouldAbort) return; // handleExistingTempUser already sent response
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
            return res.status(500).json(reply.failure(lang.OTP_FAILED));
        }
        // Send OTP via Email or SMS
        // await SendMail(user.email, "opt", "your otp is " + module);

        // Generate JWT Token
        const token = await generateToken({ id: user.id, email: user.email, userType: user.userType });
        if (!token) {
            return res.status(500).json(reply.failure(lang.TOKEN_FAILED));
        }

        return (
            res.status(202).json(reply.success(Lang.LOGIN_SUCCESS, { token, email: user.email, phoneNumber: req.body.phoneNumber }))
        )
    } catch (err) {
        console.log("Error registering new user", err.message)
        return res.status(500).json(reply.failure(err.message));
    }
}

const handleOTpverification = async (req, res) => {
    try {
        const { otp, purpose } = req.body;

        if (!req.user._id) {
            return res.status(200).json(reply.failure("id not found"))
        }

        const isverified = await verifyOTP(req.user._id, otp);

        console.log("OTP verification result:", isverified);
        if (!isverified.success) {
            return res.status(200).json(reply.failure(isverified.message))
        }

        // If newUser is true, register the userif   
        if (purpose === 'registration') {
            const registerUse = await registerUser(req.user._id);
            if (!registerUse.success) {
                return res.json(reply.failure(lang.REGISTER_FAILED))
            }

            return res.status(200).json(reply.success(lang.OTP_VERIFY, { token: registerUse.token }));
        }
        if (purpose === 'password-reset') {
            const token = generateToken({ id: req.user._id, email: req.user.email });
            return res.status(200).json(reply.success(lang.OTP_VERIFY, { canResetPassword: true, token: token }));
        }


        return res.json(reply.failure(lang.OTP_FAILED));
    } catch (error) {
        console.log("Error occuring in the handleOTpverification", error)
        return res.status(500).json(reply.failure(error.message));

    }

}

const handleforgot = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json(reply.failure("Email, username or phone number is required."));
        }

        if (email.includes('@')) {
            data = { type: 'email', message: lang.LOGIN_NOTFOUND };
        } else if (/^[6-9]\d{9}$/.test(email)) {
            data = { type: 'phoneNumber', message: lang.INCORRECT_NUMBER };
        } else {
            data = { type: 'userName', message: lang.USERNAME_NOTFOUND || "Username not found" };
        }

        let userInput = {};
        if (email.includes("@")) {
            userInput.email = email;
        } else if (/^[6-9]\d{9}$/.test(email)) {
            userInput.phoneNumber = email;
        } else {
            userInput.userName = email;
        }
        const Validation = await ExistUser(userInput);

        if (!Validation) {
            return res.status(404).json(reply.failure(data))
        }

        const module = await generateOTP(Validation.email, Validation.phoneNumber, Validation.id);

        if (!module) {
            return res.status(500).json(reply.failure(lang.OTP_FAILED));
        }
        console.log("OTP generated for forgot password:", module.otp);

        const userId = Validation.id;

        const token = await generateToken({ id: userId, email: Validation.email, userType: Validation.userType });

        // await SendMail(user.email, "opt", "your otp is " + module);
        return res.status(202).json(reply.success(lang.OTP_SEND, token))
    } catch (error) {
        console.log("Error occuring in forgot password", error.message)
        return res.status(500).json(reply.failure(error.message));
    }
}


const handleResetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        const userId = req.user._id; // Assuming user ID is stored in the JWT token
        if (!userId || !password) {
            return res.status(400).json(reply.failure("User ID and new password are required."));
        }

        const user = await authService.getUserById(userId);

        if (!user) {
            return res.status(404).json(reply.failure(lang.USER_NOT_FOUND));
        }

        const hashedPassword = await hashPassword(password); // use bcrypt or similar
        const updated = await authService.updateUser(userId, { password: hashedPassword });


        if (!updated) {
            return res.status(500).json(reply.failure("Password update failed."));
        }

        // Optional: log the user in after reset
        const token = generateToken({ id: user.id, email: user.email, userType: user.userType });

        return res.status(200).json(reply.success("Password reset successful.", { token }));
    } catch (error) {
        console.log("Error in resetting password:", error.message);
        return res.status(500).json(reply.failure(error.message));
    }
};

const hashPassword = async (password) => {
    try {
        const hashedPassword = await Bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Password hashing failed");
    }
};
module.exports = { login, Register, handleOTpverification, handleforgot, handleResetPassword }