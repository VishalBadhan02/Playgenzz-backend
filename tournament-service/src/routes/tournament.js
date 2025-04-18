const express = require("express");
const Route = express.Router();
const TournamentControlller = require("../controllers/TournamentController");

Route.post('/tournamentRegister', TournamentControlller.handleRegister)
Route.post('/setEntry', TournamentControlller.setEntry)
Route.post('/setFixtures', TournamentControlller.setFixtures)
Route.post('/login', TournamentControlller.login)

Route.put('/updateWinner', TournamentControlller.UpdateWinner)
Route.put('/deleteTeam', TournamentControlller.deleteTeam)
Route.put('/updatePayment', TournamentControlller.updatePayment)

Route.get('/setTeams/:id?', TournamentControlller.setTeam)
Route.get('/setFixtureData/:id?', TournamentControlller.getSelectedRound);
Route.get("/getTournamnets/:id", TournamentControlller.getTournaments)
Route.get("/gettournament", TournamentControlller.fetchtournament)


module.exports = Route;