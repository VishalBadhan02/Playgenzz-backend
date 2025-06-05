const prisma = require("../prisma/prisma");

class AuthService {
    constructor() { }

    async getUserById(id) {
        console.log("Fetching user by ID:", id);
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

}

module.exports = new AuthService();
