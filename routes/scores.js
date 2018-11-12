const express = require('express');
const router = express.Router();

/**
 * @api{get} /scores/:league_key/:week GetScoresForWeek
 * @apiGroup Scores
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {String} week The week number to get scores for. Should be in the form "5".
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {Number} points The number of points that the team scored during the given week.
 */
router.get('/:league_key/:week', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;
    var week = req.params.week;

    yf.league.scoreboard(
        leagueKey,
        week,
        (err, data) => parseScoresResult(res, err, data)
    );
});

function parseScoresResult(res, err, data) {
    if (err) {
        res.send(err);
    } else {
        var result = [];

        var matchupsData = data["scoreboard"]["matchups"];
        for (var i = 0; i < matchupsData.length; i++) {
            var teams = matchupsData[i]["teams"];
            for (var j = 0; j < teams.length; j++) {
                var teamData = teams[j];
                var teamResult = {};
                teamResult["team_id"] = teamData["team_id"];
                teamResult["points"] = Number(teamData["points"]["total"]);
                result.push(teamResult);
            }
        }

        res.send(result);
    }
}

module.exports = router;
