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
    async checkUniqueName(teamName, _id) {
        const query = _id ? { teamName, _id: { $ne: _id } } : { teamName };

        try {
            const unique = await TeamModel.findOne(query)
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
            const unique = await TeamModel.findOne({ user_id, games });
            if (unique) {
                return false;
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async findTeam(_id) {
        try {
            const team = await TeamModel.findOne({ _id });
            if (!team) {
                return false;
            }
            return team;
        } catch (error) {
            throw error;
        }
    }

    async updateMembersModal(query, updateData) {
        try {
            const member = await AddTeamMemberModel.findOneAndUpdate(query, { $set: updateData });
            if (!member) {
                return false;
            }
            return member;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = new TeamService();
