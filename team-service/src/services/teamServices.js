const { AddTeamMemberModel } = require("../models/addTeamMember");
const { TeamModel } = require("../models/team");


class TeamService {
    constructor() { }

    // Get the last message in a conversation
    async handleTeamRegisteation(formData, user_id) {
        try {
            const team = new TeamModel({
                user_id,
                ...formData,
            })
            await team.save()
            if (!team) {
                return false
            }
            return team
        } catch (error) {
            throw error;
        }
    }


    async addPlayerInPlayerModal(playerData) {
        try {
            const player = new AddTeamMemberModel({
                ...playerData
            })
            await player.save()
            if (!player) {
                return false
            }
            return player
        } catch (error) {
            throw error;
        }
    }


    // Get count of unread messages in a conversation
    async checkUniqueName(teamName) {
        try {
            const unique = await TeamModel.findOne({ teamName })
            if (unique) {
                return false
            }
            return true
        } catch (error) {
            throw error;
        }
    }

    // user can make only one team for one sport here 
    async checkGameExisting(user_id, games) {
        try {
            const unique = await TeamModel.findOne({ user_id, games })
            if (unique) {
                return false
            }
            return true
        } catch (error) {
            throw error;
        }
    }

    async updateNotificationForStatus(_id, status, message, actionType) {
        try {
            const modal = await NotificationModel.findOne({ _id })
            if (!modal) {
                // Handle the case where no document is found
                return null; // or throw a specific error
            }
            const grpcResponse = await grpcClientService.getFreindModalResponse(modal.entityId, actionType);


            if (!grpcResponse.isUnique) {
                return false
            }

            modal.status = status
            modal.message = message
            await modal.save()
            return modal
        } catch (error) {
            throw error;
        }
    }

    async fetchNotifications(receiverId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const notifications = await NotificationModel.find({
                receiverId,
                status: { $lte: 1 }
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return notifications;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = new TeamService();
