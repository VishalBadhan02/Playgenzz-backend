const grpc = require('@grpc/grpc-js');
const UserModel = require('../models/user');



async function createUser(call, callback) {
    const user = call.request;
    try {
        const newUser = new UserModel({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            address: user.address,
            userType: user.userType,
            status: "active",
        });

        await newUser.save();

        // Send the created user back to the client
        callback(null, { user: newUser.toObject() });
    } catch (error) {
        console.error("Error creating user:", error);

        // Invoke the callback with the error and return immediately
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
            details: error.message,
        });
        return;
    }
}

function getUser(call, callback) {
    const authId = call.request.authId;
    User.findOne({ authId }, (err, user) => {
        if (err) {
            callback({
                code: grpc.status.INTERNAL,
                message: 'Internal server error',
            });
        } else if (!user) {
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'User not found',
            });
        } else {
            callback(null, user.toObject());
        }
    });
}


module.exports = {
    createUser,
    getUser,
};