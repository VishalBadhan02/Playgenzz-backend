const teamServices = require("../services/teamServices");
const Lang = require('../language/en');
const ApiError = require('../errors/ApiError');


const checkUniquenes = async (userId, teamName, games) => {
    if (await teamServices.checkGameExisting(userId, games)) {
        const err = new ApiError(Lang.TEAM_EXIST, 409);
        throw err;
    }
    if (!await teamServices.checkUniqueName(teamName)) {
        const err = new ApiError(Lang.UNIQUE_TEAM_NAME, 409);
        throw err;
    }

}

module.exports = {
    checkUniquenes
}