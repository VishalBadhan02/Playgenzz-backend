const client = require("../grpc-clients/tournamentClient");

function getTournament(id) {
    client.GetTournament({ id }, (error, response) => {
        if (error) {
            console.error("Error fetching tournament:", error.message);
        } else {
            console.log("Tournament Details:", response.tournament);
        }
    });
}

// List multiple tournaments
function listTournaments(page = 1, limit = 5) {
    client.ListTournaments({ page, limit }, (error, response) => {
        if (error) {
            console.error("Error listing tournaments:", error.message);
        } else {
            console.log("All Tournaments:");
            response.tournaments.forEach((t, i) => {
                console.log(`${i + 1}. ${t.name} (${t.sport})`);
            });
        }
    });
}

function getMatch(id) {
    client.GetMatch({ id }, (err, response) => {
        if (err) return console.error("Error fetching match:", err.message);
        console.log("✅ Match data:", response.match);
    });
}

function listMatches(page = 1, limit = 5) {
    client.ListMatches({ page: 1, limit: 5 }, (err, response) => {
        if (err) return console.error("Error listing matches:", err.message);
        console.log("📦 Matches:", response.matches);
    });
}
module.exports = {
    getTournament,
    listTournaments,
    getMatch,
    listMatches
};