const moment = require("moment");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../services/JWT");
const client = require("../client");
const saltRounds = 16;
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

// function to generate otp
const generateOTP = async (email, phone, userId) => {
    // ✅ Ensures a 4-digit OTP
    const oneTimePassword = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOTP = await bcrypt.hash(oneTimePassword.toString(), saltRounds); // 🔒 Hash OTP

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

    return { otp: oneTimePassword, OTPModule }; // Returning plain OTP for sending via email/SMS
};

// this function only verify the otp
const verifyOTP = async (userId, enteredOTP) => {
    // ✅ Find latest OTP by email or phone
    const storedOTP = await prisma.oTP.findFirst({
        where: {
            userId,
            isUsed: false // Only check unused OTPs
        },
        orderBy: { createdAt: "desc" }, // Get latest OTP
    });

    if (!storedOTP) return { success: false, message: "OTP not found" };

    // ✅ Check expiry
    if (new Date() > storedOTP.expiresAt) {
        return { success: false, message: "OTP expired" };
    }

    // ✅ Compare hashed OTP
    const isMatch = await bcrypt.compare(enteredOTP, storedOTP.code);
    if (!isMatch) {
        // Increment attempt count
        await prisma.oTP.update({
            where: { id: storedOTP.id },
            data: { attempts: storedOTP.attempts + 1 }
        });

        return { success: false, message: "Invalid OTP" };
    }

    // ✅ Mark OTP as used
    await prisma.oTP.update({
        where: { id: storedOTP.id },
        data: { isUsed: true }
    });

    return { success: true, message: "OTP verified successfully" };
};

const registerUser = async (id) => {
    try {
        const user = await prisma.tempUser.findUnique({ where: { id } });
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // ✅ Create user in gRPC server(user - service) using Protobuf message format (user.proto)
        const userService = await client.userClient(user)

        if (!userService.success) {
            await prisma.tempUser.delete({
                where: {
                    id: user.id
                }
            });
            console.error("Failed to create user in user-service", userService.message);
            return { success: false, message: "Failed to create user in user-service" };
        }

        // ✅ Generate JWT token
        const token = await generateToken(userService.response.user);

        if (!token) {
            return { success: false, message: "Failed to generate token" };
        }
        // ✅ Store user in User table
        const newUser = await prisma.user.create({
            data: {
                id: user.id,
                name: user.userName,
                email: user.email,
                password: user.password,
                status: "active",
                userType: user.userType,
            }
        });

        if (!newUser) {
            return { success: false, message: "Failed to create user" };
        }

        await prisma.tempUser.delete({
            where: {
                id: user.id
            }
        });

        return { success: true, token };
    } catch (error) {
        console.error("Failed to register user", error);
        return { success: false, message: error.message };
    }
}


const handleUpdate = (user_id, value) => {
    // const dd = new UserModel.updateOne(user_id, value);
}

module.exports = { generateOTP, verifyOTP, registerUser }