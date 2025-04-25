// const { NotificationModel } = require("../models/notification");
const { TournamentModel } = require("../models/tournament");
const TournamentTeamsModel = require("../models/tournamentEntry");
// const grpcClientService = require("./grpcClientService");


class TournamentService {
    constructor() { }

    async fetchTournaments(query) {
        try {
            return await TournamentModel.find(query).limit(20).select('-password')
        } catch (error) {
            throw error;
        }
    }

    async fetchUserRegisteredTournaments(_id) {
        try {
            const tournament = await TournamentModel.find({ admin: _id }).select('-password');
            if (!tournament) {
                return false;
            }
            return tournament;
        } catch (error) {
            throw error;
        }
    }



    async deleteTournament(_id) {
        try {
            const modal = await TournamentModel.findOneAndDelete({ _id })
            if (!modal) {
                return "no modal found"
            }
            return modal
        } catch (error) {
            throw error;
        }
    }


    // Get count of unread messages in a conversation
    async updateTournament(entityId, status, message) {
        try {
            const modal = await TournamentModel.findOneAndUpdate({ entityId }, {
                $set: {
                    status: status,
                    message: message
                }
            })
            return modal
        } catch (error) {
            throw error;
        }
    }

    async findTournament(_id) {
        try {
            const modal = await TournamentModel.findOne({ _id })
            if (!modal) {
                return false;
            }
            return modal;
        } catch (error) {
            throw error;
        }
    }

    async getTournamentTeams(query) {
        try {
            const modal = await TournamentTeamsModel.find(query)
            if (!modal) {
                // Handle the case where no document is found
                return null; // or throw a specific error
            }
            // const grpcResponse = await grpcClientService.getFreindModalResponse(modal.entityId, actionType);
            return modal
        } catch (error) {
            throw error;
        }
    }

    async updateTournamentTeamModal(_id, update) {
        try {
            const updatedDoc = await TournamentTeamsModel.findOneAndUpdate(
                { _id },
                update,
                { new: true } // This returns the updated document instead of the old one
            );

            if (!updatedDoc) {
                return false; // or you could throw a custom error here
            }

            return updatedDoc;
        } catch (error) {
            throw new Error("Error updating team modal: " + error.message);
        }
    }


}

module.exports = new TournamentService();
