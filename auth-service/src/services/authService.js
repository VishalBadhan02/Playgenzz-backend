const { NotificationModel } = require("../models/notification");
const prisma = require("../prisma/prisma");
const grpcClientService = require("./grpcClientService");
const util = require('util');


class AuthService {
    constructor() { }

    // Update user by ID
    async updateUser(userId, updatedData) {
        const updatedUser = await prisma.user.update({
            where: {
                id: userId, // or use email, username etc. if they are unique
            },
            data: updatedData, // e.g., { name: 'New Name' }
        });

        return updatedUser;
    };

    // Update user by email
    async updateUserByEmail(email, data) {
        const updated = await prisma.user.update({
            where: { email }, // must be unique
            data,
        });
        return updated;
    };

}

module.exports = new AuthService();
