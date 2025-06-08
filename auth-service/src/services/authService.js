const prisma = require("../prisma/prisma");

class AuthService {
    constructor() { }

    async registerTempUser(userData) {
        try {
            const tempUser = await prisma.tempUser.create({
                data: userData, // e.g., { userName: 'JohnDoe', email: '
            })
            return tempUser;

        } catch (error) {
            console.error("Error creating temporary user:", error);
            throw new Error("Failed to create temporary user");
        }
    }

    async createUser(userData) {
        try {
            const user = await prisma.user.create({
                data: userData,
            });
            return user;
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
        }
    }


    async getUserById(id) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    // Update user by ID
    async updateUser(userId, updatedData) {
        try {
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId, // or use email, username etc. if they are unique
                },
                data: updatedData, // e.g., { name: 'New Name' }
            });
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
        }

    };

    // Update user by email
    async updateUserByEmail(email, data) {
        try {
            const updated = await prisma.user.update({
                where: { email }, // must be unique
                data,
            });
            return updated;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
        }
    };

    async getTempUserById(id) {
        try {
            const tempUser = await prisma.tempUser.findUnique({
                where: { id }
            });
            if (!tempUser) {
                throw new Error("Temporary user not found");
            }
            return tempUser;
        }
        catch (error) {
            console.error("Error fetching temporary user:", error);
            throw new Error("Failed to fetch temporary user");
        }
    }

    async deleteTempUser(id) {
        try {
            const deletedUser = await prisma.tempUser.delete({
                where: { id }
            });
            return deletedUser;
        } catch (error) {
            console.error("Error deleting temporary user:", error);
            throw new Error("Failed to delete temporary user");
        }
    }

    async existingTempUser(userInput) {
        try {
            const user = await prisma.tempUser.findFirst({
                where: {
                    OR: [
                        { email: userInput.email },
                        { phoneNumber: userInput.phoneNumber },
                    ]
                }
            });
            return user;
        } catch (error) {
            console.error("Error checking existing temporary user:", error);
            throw new Error("Failed to check existing temporary user");
        }
    }



}

module.exports = new AuthService();
