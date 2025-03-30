const grpc = require('@grpc/grpc-js');
const UserModel = require('../models/user');
const teamClient = require('../gRPCClient');



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

async function getUser(call, callback) {
    const authId = call.request.user_id;
    try {
        const user = await UserModel.findOne({ _id: authId })
        if (!user) {
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'User not found',

            })
        }
        return callback(null, { user: user.toObject() });
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

const getTeamByUser = (userId) => {
    return new Promise((resolve, reject) => {
        teamClient.GetTeamByUser({ user_id: userId }, (error, response) => {
            if (error) {
                console.error('Error fetching team data:', error);
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};



module.exports = {
    createUser,
    getUser,
    getTeamByUser
};