const moment = require("moment");
const prisma = require("../../prisma/prisma");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middlewares/JWT");
const client = require("../client");
const { storedOtpModal, getOtp, deleteOtp } = require("../services/redisTokenService");
const redis = require("../redis/redisClient");
const authService = require("../services/authService");
const grpcService = require("../services/grpcService");
const saltRounds = 16;
// const reply = require('./reply');
// const lang = require('../language/en');

const ExistUser = async (userInput) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: userInput.email },
                { phoneNumber: userInput.phoneNumber },
                { name: userInput.userName },
            ]
        }
    });
    return user;
}





// function to generate otp
const generateOTP = async (email, phone, userId) => {
    // ✅ Ensures a 4-digit OTP
    const oneTimePassword = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOTP = await bcrypt.hash(oneTimePassword.toString(), saltRounds); // 🔒 Hash OTP

    // Store OTP in Redis for 5 minutes

    // ✅ Store OTP in PostgreSQL using Prisma
    const OTPModule = await prisma.oTP.create({
        data: {
            email: email || null, // If email exists, store it
            phone: phone || null, // If phone exists, store it
            code: hashedOTP, // ✅ Store hashed OTP
            attempts: 0, // Initial attempt count
            isUsed: false, // OTP is not used yet
            expiresAt: moment().add(10, "minutes").toDate(), // ⏳ Expiry after 10 minutes
            userId: userId || null, // Associate OTP with temp user
        }
    });
    if (!OTPModule) false;

    // Store OTP in Redis for 5 minutes
    await storedOtpModal(userId, {
        code: hashedOTP,
        attempts: 0,
        id: OTPModule.id
    });

    return { otp: oneTimePassword, OTPModule }; // Returning plain OTP for sending via email/SMS
};

// this function only verify the otp
const verifyOTP = async (userId, enteredOTP) => {
    const redisData = await getOtp(userId);

    if (!redisData) {
        return { success: false, message: "OTP expired or invalid" };
    }

    const otpData = redisData;
    const isMatch = await bcrypt.compare(enteredOTP, otpData.code);

    if (!isMatch) {
        // Check if max attempts reached
        if (otpData.attempts >= 5) {
            await redis.del(`otp:${userId}`);
            return { success: false, message: "Too many incorrect attempts. OTP expired." };
        }

        // Increment attempt count
        const updatedAttempts = otpData.attempts + 1;
        const attemptsLeft = 5 - updatedAttempts;

        await prisma.oTP.update({
            where: { id: otpData.id },
            data: { attempts: updatedAttempts }
        });

        // Update Redis
        otpData.attempts = updatedAttempts;
        await redis.set(`otp:${userId}`, JSON.stringify(otpData), 'EX', 60 * 5);

        return {
            success: false,
            message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left.`
        };
    }

    // ✅ OTP matched
    await deleteOtp(userId);

    await prisma.oTP.update({
        where: { id: otpData.id },
        data: { isUsed: true }
    });

    return { success: true, message: "OTP verified successfully" };
};


const registerUser = async (id) => {
    try {
        // ✅ Check if user exists in temporary user table
        const user = await authService.getTempUserById(id);

        // If user does not exist, return error
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // ✅ Create user in gRPC server(user - service) using Protobuf message format (user.proto)
        const userService = await grpcService.createUser(user)

        // If userService fails, delete the temporary user from the database
        if (!userService.success) {
            await authService.deleteTempUser(user.id); // Delete temp user if gRPC call fails
            // If userService fails, delete the temporary user from the database
            console.error("Failed to create user in user-service", userService.message);
            return { success: false, message: "Failed to create user in user-service" };
        }

        // ✅ Generate JWT token

        // ✅ Store user in User table
        const newUser = await authService.createUser({
            id: user.id,
            name: user.userName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            password: user.password,
            status: "active",
            userType: user.userType,
        });

        if (!newUser) {
            console.error("Failed to create user in database");
            return { success: false, message: "Failed to create user in database" };
        }

        const token = generateToken({ ...userService.response.user, authToken: true });

        if (!token) {
            return { success: false, message: "Failed to generate token" };
        }

        // ✅ Delete temporary user from database
        await authService.deleteTempUser(user.id);

        return { success: true, token };
    } catch (error) {
        console.error("Failed to register user", error);
        return { success: false, message: error.message };
    }
}

const handleExistingTempUser = async (existingTemp, userName, email, phoneNumber, res) => {
    const hasExpired = Date.now() - new Date(existingTemp.createdAt).getTime() > 15 * 60 * 1000; // 15 minutes

    if (hasExpired) {
        await prisma.tempUser.delete({ where: { id: existingTemp.id } });
        return false; // Continue registration
    }

    // Identify conflicting field
    let field = '';
    if (existingTemp.userName !== userName) {
        field = 'userName';
    } else if (existingTemp.email !== email) {
        field = 'email';
    } else if (existingTemp.phoneNumber !== phoneNumber) {
        field = 'phone';
    } else {
        field = 'user'; // fallback
    }

    res.status(409).json(
        reply.failure({ type: field, message: `${field} already exists in temporary user` })
    );

    return true; // Stop registration
};





module.exports = { generateOTP, verifyOTP, registerUser, ExistUser, handleExistingTempUser }