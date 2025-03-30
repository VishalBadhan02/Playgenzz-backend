const express = require("express");
const Route = express.Router();
const TeamControlller = require("../controllers/TeamController")


Route.get("/getTeam/:team_A?/:team_B?", TeamControlller.getTeam)
Route.get("/getTeamProfile/:_id?", TeamControlller.getTeamProfile)
Route.get("/getTeams/:game?", TeamControlller.getTeams)
Route.get("/matches", TeamControlller.getMatches)
Route.get("/scoreCards", TeamControlller.fetchScoreCards)

Route.post("/handleRequest", TeamControlller.handleMatchRequest)
Route.post("/teamRegistration", TeamControlller.registerTeam)

Route.put("/handleScore", TeamControlller.manageScore)
Route.put("/setActiveTeam", TeamControlller.setActiveTeam)
Route.put("/updateTeam", TeamControlller.updateTeam)

Route.delete("/removePlayer", TeamControlller.deleteTeamMember)


module.exports = Route;