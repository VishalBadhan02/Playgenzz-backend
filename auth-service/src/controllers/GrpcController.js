const authService = require('../services/authService');


async function updateUserInfo(call, callback) {
    const data = call.request;
    const { id, name, email, phoneNumber } = data;

    try {
        await authService.updateUser(id, {
            ...(name && { name }),
            ...(email && { email }),
            ...(phoneNumber && { phoneNumber }),
        });

        callback(null, {
            success: true,
            message: 'User info updated successfully.',
        });
    } catch (error) {
        console.error('Error updating user info in auth-service:', error);
        callback(null, {
            success: false,
            message: 'Failed to update user info in auth-service.',
        });
    }
}


module.exports = {
    updateUserInfo
};
