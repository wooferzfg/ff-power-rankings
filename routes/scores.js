const express = require('express');
const router = express.Router();

router.get('/:leagueKey/:week', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.leagueKey;
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
                teamResult["points"] = teamData["points"]["total"];
                result.push(teamResult);
            }
        }

        res.send(result);
    }
}

module.exports = router;
