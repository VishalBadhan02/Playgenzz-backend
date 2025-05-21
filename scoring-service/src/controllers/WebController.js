const scorecardService = require("../services/scorecardService");
const { setPlaying } = require("../utils/setPlaying");

async function ScoreUpdate(ws, data, wss) {
    try {
        const { matchId, data: scoreData, sequenceNumber, timestamp, updatedBy } = data;
        const { type, value, extraType, playerId } = scoreData;
        // Fetch the scorecard from the database   
        const scorecard = await ScoreCardModel.findOne({ _id: matchId }).populate('teams.teamA.teamId')  // Populate team A details
            .populate('teams.teamB.teamId');
        if (!scorecard) {
            console.error('Scorecard not found for matchId:', matchId);
            return;
        }

        // Determine which team the player belongs to
        const teamKey = ['teamA', 'teamB'].find(teamKey =>
            scorecard.teams[teamKey].players.some(p => p.playerId.equals(playerId))
        );

        if (!teamKey) {
            console.error('Player not found in any team:', playerId);
            return;
        }
        // Convert sportSpecificDetails Map to Object
        const sportSpecificDetailsObj = Object.fromEntries(scorecard.sportSpecificDetails);


        // console.log("curent", Math.floor(sportSpecificDetailsObj.currentOver))

        if (type == "undo") {
            console.log("here")
            await scorecard.undo();
            return res.send('Last change undone');
        }

        // Handle different types of events
        if (type === 'score') {

            // Update the player's statistics
            const playerStats = {
                runs: value,
                order: value,
                balls: 1 // Add one ball faced
            };
            await scorecard.updatePlayerStats(scorecard.teams[teamKey].teamId, playerId, playerStats);

            // Update the team's score

            // Update current bowler statistics if applicable
            if (sportSpecificDetailsObj.currentBowler && sportSpecificDetailsObj.currentBowler.playerId) {
                const bowlerId = sportSpecificDetailsObj.currentBowler.playerId;
                const bowlerStats = {
                    runsConceded: value,
                    ballsConceded: 1,
                    orderConceded: value,
                    type: "bowler"
                };
                await scorecard.updatePlayerStats(scorecard.teams[teamKey === 'teamA' ? 'teamB' : 'teamA'].teamId, bowlerId, bowlerStats);

                // Update current bowler's stats in sportSpecificDetails
                sportSpecificDetailsObj.currentBowler.stats.runs += value;
                sportSpecificDetailsObj.currentBowler.stats.balls += 1;
                if (!Array.isArray(sportSpecificDetailsObj.currentBowler.stats.order)) {
                    sportSpecificDetailsObj.currentBowler.stats.order = [];
                }
                sportSpecificDetailsObj.currentBowler.stats.order.push(value);
            } else {
                console.error('Current bowler information is missing or incomplete');
            }

            // Handle strike rotation if runs are odd


            // Update the striker's stats in sportSpecificDetails
            if (sportSpecificDetailsObj.striker && sportSpecificDetailsObj.striker.playerId === playerId) {
                sportSpecificDetailsObj.striker.stats.runs += value;
                sportSpecificDetailsObj.striker.stats.balls += 1;

                // Handle boundary cases
                if (value === 4) {
                    sportSpecificDetailsObj.striker.stats.fours += 1;
                } else if (value === 6) {
                    sportSpecificDetailsObj.striker.stats.sixes += 1;
                }
            }

            if (value % 2 !== 0) {
                const { striker, nonStriker } = sportSpecificDetailsObj;

                // Rotate the striker and non-striker
                sportSpecificDetailsObj.striker = nonStriker;
                sportSpecificDetailsObj.nonStriker = striker;
            }

            // Handle over completion
            const currentOver = sportSpecificDetailsObj.currentOver || 0;
            const ballsThisOver = Math.floor((currentOver % 1) * 10); // Get the decimal part as balls bowled in this over
            if (ballsThisOver + 1 >= 6) {

                // Over is completed    
                sportSpecificDetailsObj.currentOver = Math.floor(currentOver) + 1; // Increment over

                // Update the current bowler
                sportSpecificDetailsObj.currentBowler = null;
                scorecard.matchStatus = "innings_setup";

                // Rotate the striker and non-striker
                const { striker, nonStriker } = sportSpecificDetailsObj;
                sportSpecificDetailsObj.striker = nonStriker;
                sportSpecificDetailsObj.nonStriker = striker;
            } else {
                // Increment the ball count in the current over
                sportSpecificDetailsObj.currentOver += 0.1;
            }


        } else if (type === 'out') {
            // Handle wicket event
            const { striker, nonStriker, currentBowler } = sportSpecificDetailsObj;

            // Update the out player's stats
            if (striker && striker.playerId === playerId) {
                striker.stats.status = 'out';
                const StrikerStats = {
                    status: "out"
                }
                await scorecard.updatePlayerStats(scorecard.teams[teamKey === 'teamA' ? 'teamA' : 'teamB'].teamId, playerId, StrikerStats);
                sportSpecificDetailsObj.striker = null;
            } else if (nonStriker && nonStriker.playerId === playerId) {
                nonStriker.stats.status = 'out';
                const nonStrikerStats = {
                    status: "out"
                }
                await scorecard.updatePlayerStats(scorecard.teams[teamKey === 'teamA' ? 'teamA' : 'teamB'].teamId, playerId, nonStrikerStats);
                sportSpecificDetailsObj.nonStriker = null; // Prompt user to select new batsman
            }
            scorecard.matchStatus = "innings_setup"
            // Increment wicket count for the bowler
            if (currentBowler && currentBowler.playerId) {
                currentBowler.stats.wickets = (currentBowler.stats.wickets || 0) + 1;
                if (!Array.isArray(sportSpecificDetailsObj.currentBowler.stats.order)) {
                    sportSpecificDetailsObj.currentBowler.stats.order = [];
                }
                sportSpecificDetailsObj.currentBowler.stats.order.push("W");
                const bowlerStats = {
                    wickets: 1
                }
                await scorecard.updatePlayerStats(scorecard.teams[teamKey === 'teamA' ? 'teamB' : 'teamA'].teamId, currentBowler.playerId, bowlerStats);
            }
            const outmatchStats = {
                wickets: 1
            }
            await scorecard.updateMatchStats(outmatchStats);

            // Increment team wicket count
            scorecard.teams[teamKey].wickets = (scorecard.teams[teamKey].wickets || 0) + 1;
        }
        else if (type === 'extra') {
            // Handle extras
            const { striker, nonStriker, currentBowler } = sportSpecificDetailsObj;
            if (!Array.isArray(sportSpecificDetailsObj.currentBowler.stats.order)) {
                sportSpecificDetailsObj.currentBowler.stats.order = [];
            }

            // Update the team's score
            if (value % 2 !== 0) {
                // const { striker, nonStriker } = sportSpecificDetailsObj;

                // Rotate the striker and non-striker
                sportSpecificDetailsObj.striker = nonStriker;
                sportSpecificDetailsObj.nonStriker = striker;
            }
            const outmatchStats = {
                extras: extraType,
            }

            await scorecard.updateMatchStats(outmatchStats);


            // Update current bowler statistics if applicable
            if (sportSpecificDetailsObj.currentBowler && sportSpecificDetailsObj.currentBowler.playerId) {
                const bowlerId = sportSpecificDetailsObj.currentBowler.playerId;
                const bowlerStats = {
                    runsConceded: value,
                    // balls: 1 // Add one ball bowled unless it's a wide or no-ball
                };
                if (extraType !== 'wide' && extraType !== 'noBall') {
                    bowlerStats.balls = 1;
                }
                await scorecard.updatePlayerStats(scorecard.teams[teamKey === 'teamA' ? 'teamB' : 'teamA'].teamId, bowlerId, bowlerStats);

                // Update current bowler's stats in sportSpecificDetails
                sportSpecificDetailsObj.currentBowler.stats.runs += value;
                if (extraType !== 'wide' && extraType !== 'noBall') {
                    sportSpecificDetailsObj.currentBowler.stats.balls += 1;
                }
            } else {
                console.error('Current bowler information is missing or incomplete');
            }

            // Update extras statistics
            if (!sportSpecificDetailsObj.extras) {
                sportSpecificDetailsObj.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };
            }
            if (extraType === 'wide') {
                sportSpecificDetailsObj.extras.wides += value;

                sportSpecificDetailsObj.currentBowler.stats.order.push("Wd");
            } else if (extraType === 'noBall') {
                sportSpecificDetailsObj.extras.noBalls += value;
                sportSpecificDetailsObj.currentBowler.stats.order.push("Nb");
            } else if (extraType === 'bye') {
                sportSpecificDetailsObj.extras.byes += value;
                sportSpecificDetailsObj.currentBowler.stats.order.push("B");
            } else if (extraType === 'legBye') {
                sportSpecificDetailsObj.extras.legByes += value;
                sportSpecificDetailsObj.currentBowler.stats.order.push("Lb");

            }

            // Handle over completion if applicable
            if (extraType !== 'wide' && extraType !== 'noBall') {
                const currentOver = sportSpecificDetailsObj.currentOver || 0;
                const ballsThisOver = Math.floor((currentOver % 1) * 10); // Get the decimal part as balls bowled in this over
                if (ballsThisOver + 1 >= 6) {
                    // Over is completed
                    sportSpecificDetailsObj.currentOver = Math.floor(currentOver) + 1; // Increment over

                    // Update the current bowler
                    sportSpecificDetailsObj.currentBowler = null;
                    scorecard.matchStatus = "innings_setup";

                    // Rotate the striker and non-striker
                    const { striker, nonStriker } = sportSpecificDetailsObj;
                    sportSpecificDetailsObj.striker = nonStriker;
                    sportSpecificDetailsObj.nonStriker = striker;
                } else {
                    // Increment the ball count in the current over
                    sportSpecificDetailsObj.currentOver += 0.1;
                }
            }
        }

        // Update the sportSpecificDetails in the scorecard

        // Optionally, update match statistics if needed
        let extra = ["wide", "noBall"].includes(extraType) ? 1 : 0
        const matchStats = {
            totalScore: value + extra
        };


        await scorecard.updateMatchStats(matchStats);


        scorecard.sportSpecificDetails = new Map(Object.entries(sportSpecificDetailsObj));

        // Save the updated scorecard
        await scorecard.save();

        // Broadcast the updated scorecard to all connected clients
        if (wss.clients) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'score_update_request', scorecard }));
                }
            });
        } else {
            console.error('WebSocket clients are not defined');
        }


        return true

    } catch (error) {
        console.error('Error updating score:', error);
    }
}

async function InningUpdate(req, res) {
    try {
        const update = await ScoreCardModel.findById(req.params.id)
        // console.log(req.body)
        if (!update) {
            return res.json(reply.failure("Match not found"))
        }
        if (req.body.status === "innings_setup") {
            update.matchStatus = req.body.status
            await update.save();
            return res.json(reply.success())
        }
        else if (req.body.status === "inningEnd") {
            const sportSpecificDetails = Object.fromEntries(update.sportSpecificDetails)
            const matchStatistics = Object.fromEntries(update.matchStatistics)
            sportSpecificDetails.currentInning = 2;
            sportSpecificDetails.currentOver = 0;
            sportSpecificDetails.striker = null;
            sportSpecificDetails.nonStriker = null;
            sportSpecificDetails.currentBowler = null;
            update.currentPeriod.periodNumber = 2;
            matchStatistics.totalScore = 0;
            matchStatistics.wickets = 0;
            update.matchStatus = "set_seccond_half"
            update.sportSpecificDetails = new Map(Object.entries(sportSpecificDetails));
            update.matchStatistics = new Map(Object.entries(matchStatistics));
        }
        else if (req.body.status === "winner") {
            await update.determineWinner();
            sportSpecificDetails.currentInning = 2;
            update.matchStatus = "completed"
            // console.log("here")

        }
        await update.save();

        return res.json(reply.success("Scorecard initialized", update._id));

    } catch (error) {
        return res.json(reply.failure("error updating new inning"))
    }
}


async function matchSetup(matchData) {
    try {
        const { matchId, data } = matchData;
        const { toss, battingTeam, bowlingTeam, playerSettigns } = data;
        const scorecard = await scorecardService.getScorecard({ matchId });

        const userMap = new Map();
        const sportSpecificDetails = scorecard?.sportSpecificDetails;
        const teamAPlayer = scorecard?.teams.teamA.players;
        const teamBPlayer = scorecard?.teams.teamB.players;
        const totalPlayers = [...teamAPlayer, ...teamBPlayer];

        totalPlayers?.forEach(user => {
            userMap.set(user.playerId.toString(), user); // id here is same as playerId
        });

        const formatedDataforUpdate = {
            toss: { winner: toss.winner.id, winnerName: toss.winner.name, decision: toss.decision },
            inningChoice: toss.decision,
            striker: setPlaying(playerSettigns.selectedStriker, userMap),
            nonStriker: setPlaying(playerSettigns.selectedNonStriker, userMap),
            currentBowler: setPlaying(playerSettigns.selectedBowler, userMap),
            firstInnings: {
                battingTeam: battingTeam.id,
                battingTeamName: battingTeam.name,
                bowlingTeam: bowlingTeam.id,
                bowlingTeamName: bowlingTeam.name,
            },
            secondInnings: {
                battingTeam: bowlingTeam.id,
                battingTeamName: bowlingTeam.name,
                bowlingTeam: battingTeam.id,
                bowlingTeamName: battingTeam.name,
            }
        };

        // ✅ Convert to Map
        const sportDetailsMap = scorecard.sportSpecificDetails;

        // ✅ Update existing keys only
        for (const [key, value] of Object.entries(formatedDataforUpdate)) {
            sportDetailsMap.set(key, value);

        }

        // ✅ Convert back to plain object
        scorecard.sportSpecificDetails = sportDetailsMap;
        scorecard.markModified('sportSpecificDetails');
        await scorecard.save();

    } catch (error) {
        console.log("Error occurring in the match setup");
        throw error;
    }
}

module.exports = {
    ScoreUpdate, InningUpdate, matchSetup
};