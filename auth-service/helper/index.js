const UserModel = require("../models/user")
const OTPModel = require("../models/otps")
const moment = require("moment");
const prisma = require("../prisma/prisma");
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


const generateOTP = async (email, phone, tempUserId) => {
    // ✅ Ensures a 4-digit OTP
    const oneTimePassword = Math.floor(1000 + Math.random() * 9000).toString();

    // ✅ Store OTP in PostgreSQL using Prisma
    const OTPModule = await prisma.oTP.create({
        data: {
            email: email || null, // If email exists, store it
            phone: phone || null, // If phone exists, store it
            code: oneTimePassword, // ✅ Store hashed OTP
            attempts: 0, // Initial attempt count
            isUsed: false, // OTP is not used yet
            expiresAt: moment().add(10, "minutes").toDate(), // ⏳ Expiry after 10 minutes
            tempUserId: tempUserId || null, // Associate OTP with temp user
        }
    });
    if (!OTPModule) false;

    return { otp: oneTimePassword, OTPModule }; // Returning plain OTP for sending via email/SMS
};

// const generateOTP = async (userId, comment) => {
//     const oneTimePassword = Math.floor(Math.random(0) * (10000 - 999 + 1) + 999);
//     const setoneTimePassword = oneTimePassword.toString();

//     const OTPModule = new OTPModel();
//     OTPModule.userId = userId;
//     OTPModule.otp = setoneTimePassword;
//     OTPModule.comment = comment;
//     OTPModule.expiredate = moment(new Date()).add(10, 'minutes').toDate();
//     OTPModule.save()
//     return OTPModule;
// }

// const verifyOTP = async (userId, otp) => {
//     const OTPRecord = await OTPModel.findOne({ userId: userId }).sort({ "createdAt": "desc" });
//     if (OTPRecord.otp === otp) {
//         return { status: true, msg: "otp verified successfully" }
//     }
//     if (!OTPRecord) {
//         return { status: false, msg: "otp not found" }
//     }

// }


const verifyOTP = async (emailOrPhone, enteredOTP) => {
    // ✅ Find latest OTP by email or phone
    const storedOTP = await prisma.oTP.findFirst({
        where: {
            OR: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ],
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


const handleUpdate = (user_id, value) => {
    const dd = new UserModel.updateOne(user_id, value);
}

module.exports = { generateOTP, verifyOTP }