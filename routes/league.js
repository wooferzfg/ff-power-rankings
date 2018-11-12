const express = require('express');
const router = express.Router();

/**
 * @api{get} /league/:league_key/settings GetLeagueSettings
 * @apiGroup League
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * 
 * @apiSuccess {String} name The name of the league.
 * @apiSuccess {String} season The year/season that the league was a part of.
 * @apiSuccess {Number} num_teams The total number of teams in the league.
 * @apiSuccess {Number} current_week The current week for the league if it is in progress.
 * @apiSuccess {Number} total_weeks The total number of weeks in the league's regular season.
 */
router.get('/:league_key/settings', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;

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
        result["current_week"] = parseInt(data["current_week"]);
        result["total_weeks"] = parseInt(data["settings"]["playoff_start_week"]) - 1;

        res.send(result);
    }
}

/**
 * @api{get} /league/:league_key/teams GetLeagueTeams
 * @apiGroup League
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {String} name The name of the team.
 * @apiSuccess {String} logo_url The url of the team's logo.
 */
router.get('/:league_key/teams', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;

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
