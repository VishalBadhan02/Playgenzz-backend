const grpc = require('@grpc/grpc-js');
const UserModel = require('../../../auth-service/src/models/user');


async function createUser(call, callback) {
    console.log(call.request);
    try {
        const newUser = new UserModel({ ...call.request });
        await newUser.save();
        console.log("user creared", newUser);
    } catch (error) {
        console.log("error", error);
    }

    // newUser.save((err, user) => {
    //     if (err) {
    //         callback({
    //             code: grpc.status.INTERNAL,
    //             message: 'Internal server error',
    //         });
    //     } else {
    //         callback(null, user.toObject());
    //     }
    // });
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