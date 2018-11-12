const express = require('express');
const router = express.Router();

router.get('/:leagueKey/settings', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.leagueKey;

    yf.league.settings(
        leagueKey,
        (err, data) => parseLeagueResult(res, err, data)
    );
});

function parseLeagueResult(res, err, data) {
    if (err) {
        res.send(err);
    } else {
        var result = {};

        result["name"] = data["name"];
        result["season"] = data["season"];
        result["num_teams"] = data["num_teams"];
        result["current_week"] = data["current_week"];
        result["total_weeks"] = parseInt(data["settings"]["playoff_start_week"]) - 1;

        res.send(result);
    }
}

router.get('/:leagueKey/teams', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.leagueKey;

    yf.league.teams(
        leagueKey,
        (err, data) => parseTeamsResult(res, err, data)
    );
});

function parseTeamsResult(res, err, data) {
    if (err) {
        res.send(err);
    } else {
        var result = [];

        var teamsData = data["teams"];
        for (var i = 0; i < teamsData.length; i++) {
            var curTeamData = teamsData[i];
            var teamResult = {};
            teamResult["team_id"] = curTeamData["team_id"];
            teamResult["name"] = curTeamData["name"];
            teamResult["logo_url"] = curTeamData["team_logos"][0]["url"];
            result.push(teamResult);
        }

        res.send(result);
    }
}

module.exports = router;
