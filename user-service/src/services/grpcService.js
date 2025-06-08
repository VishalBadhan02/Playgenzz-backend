const authClient = require("../grpc-clients/authClient");
const { teamClient } = require("../grpc-clients/teamClient");

class grpcService {
    constructor() { }

    // Get the last message in a conversation
    async UpdateAuthService(data) {
        console.log("🚀 Calling UpdateAuthService with data:", data); // Add this
        try {
            const response = await new Promise((resolve, reject) => {
                authClient.UpdateUserInfo(data, (error, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });
            return response;
        } catch (error) {
            console.error("❌ Error in UpdateAuthService:", error);
            return error;
        }
    }
    async getTeamByUser(userId) {
        return new Promise((resolve, reject) => {
            teamClient.getTeamByUser({ user_id: userId }, (error, response) => {
                if (error) {
                    console.error('Error fetching team data:', error);

                    // ✅ Return appropriate gRPC error codes
                    if (error.code === grpc.status.NOT_FOUND) {
                        return reject({
                            code: grpc.status.NOT_FOUND,
                            message: "Team not found for the user.",
                        });
                    }
                    return reject({
                        code: grpc.status.INTERNAL,
                        message: "Error fetching team data.",
                        details: error.message,
                    });

                } else {
                    resolve(response);
                }
            });
        });
    };

}

module.exports = new grpcService();

