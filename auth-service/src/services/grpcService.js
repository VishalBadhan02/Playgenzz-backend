const userClient = require("../grpc-clients/userClient");

class GrpcService {

    async createUser(data) {
        return new Promise((resolve, reject) => {
            userClient.CreateUser(data, (error, response) => {
                if (error) {
                    console.error("gRPC CreateUser error:", error.message);
                    return reject({ success: false, message: error.message });
                }
                resolve({ success: true, response });
            });
        }).catch((err) => err);
    }

    async getUser(userId) {
        return new Promise((resolve, reject) => {
            userClient.GetUser({ user_id: userId }, (error, response) => {
                if (error) {
                    return reject({ success: false, message: error.message });
                }
                resolve({ success: true, response });
            });
        }).catch((err) => err);
    }

    async checkUniqueUserName(userName) {
        return new Promise((resolve, reject) => {
            userClient.GetUserName({ userName }, (error, response) => {
                if (error) {
                    console.error("gRPC GetUserName error:", error.message);
                    return reject({ success: false, message: error.message });
                }
                resolve({ success: true, response });
            });
        }).catch((err) => err);
    }
}

module.exports = new GrpcService();
