const express = require('express');
const router = express.Router();

/**
 * @api{get} /scores/:league_key/:up_to_week GetScoresForWeek
 * @apiGroup Scores
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {Number} up_to_week The last week number to get scores for. If the parameter is "5", scores for weeks 1 through 5 will be returned.
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {Number} week The week that the points were scored during.
 * @apiSuccess {Number} points The number of points that the team scored during the given week.
 */
router.get('/:league_key/:up_to_week', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;
    var upToWeek = parseInt(req.params.up_to_week);
    getScores(yf, leagueKey, upToWeek, res, result => {
        res.status(200).json(result);
    });
});

function getScores(yf, leagueKey, upToWeek, res, callback) {
    var weeks = getWeeksString(upToWeek);

    yf.league.scoreboard(
        leagueKey,
        weeks,
        (err, data) => parseScoresResult(res, err, data, callback)
    );
}

function getWeeksString(upToWeek) {
    var weeks = [];
    for (var i = 1; i <= upToWeek; i++) {
        weeks.push(i);
    }
    return weeks.join();
}

function parseScoresResult(res, err, data, callback) {
    if (err) {
        res.status(400).json(err);
    } else {
        var result = [];

        var matchupsData = data["scoreboard"]["matchups"];
        for (var i = 0; i < matchupsData.length; i++) {
            var teams = matchupsData[i]["teams"];
            for (var j = 0; j < teams.length; j++) {
                var teamData = teams[j];
                var teamResult = {};
                teamResult["team_id"] = teamData["team_id"];
                teamResult["week"] = parseInt(teamData["points"]["week"]);
                teamResult["points"] = Number(teamData["points"]["total"]);
                result.push(teamResult);
            }
        }

        callback(result);
    }
}

router.getScores = getScores;
module.exports = router;
