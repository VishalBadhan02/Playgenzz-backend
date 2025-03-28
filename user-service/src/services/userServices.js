// services/userService.js
const grpc = require('@grpc/grpc-js');
const User = require('../models/userModel');

const createUser = (call, callback) => {
    const newUser = new User(call.request);
    newUser.save((err, user) => {
        if (err) {
            callback({
                code: grpc.status.INTERNAL,
                message: 'Internal server error',
            });
        } else {
            callback(null, { user });
        }
    });
};

const getUser = (call, callback) => {
    const { user_id } = call.request;
    User.findById(user_id, (err, user) => {
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
            callback(null, { user });
        }
    });
};

module.exports = {
    createUser,
    getUser,
};
