const { ScoreUpdate, matchSetup } = require("../controllers/WebController");

const handleWebRouting = async (message) => {
    try {
        const data = JSON.parse(message);
        if (data.type === "matchsetup") {
            await matchSetup( data);
        }
    } catch (error) {
        throw error
    }
}

module.exports = handleWebRouting