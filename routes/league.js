const auth = require('./auth');
const express = require('express');
const math = require('mathjs');
const router = express.Router();

/**
 * @api{get} /league/:league_key/settings?token=:token GetLeagueSettings
 * @apiGroup League
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {String} name The name of the league.
 * @apiSuccess {String} season The year/season that the league was a part of.
 * @apiSuccess {Number} num_teams The total number of teams in the league.
 * @apiSuccess {Number} current_week The current week for the league if it is in progress.
 * @apiSuccess {Number} total_weeks The total number of weeks in the league's regular season.
 * @apiSuccess {Number} expected_mean The expected mean scoring for each team in each week of the season.
 */
router.get('/:league_key/settings', function (req, res) {
    var yf = auth.getYF(req.query.token);
    var leagueKey = req.params.league_key;

    yf.league.settings(
        leagueKey,
        (err, data) => parseLeagueResult(res, err, data)
    );
});

function parseLeagueResult(res, err, data) {
    if (err) {
        res.status(400).json(err);
    } else {
        var result = {};

        var positions = data["settings"]["roster_positions"];
        var numTeams = data["num_teams"];

        result["name"] = data["name"];
        result["season"] = data["season"];
        result["num_teams"] = numTeams;
        result["current_week"] = parseInt(data["current_week"]);
        result["total_weeks"] = parseInt(data["settings"]["playoff_start_week"]) - 1;
        result["expected_mean"] = calculateMean(positions, numTeams);

        res.status(200).json(result);
    }
}

const positionValues = { // from historical data
    "QB": 285,
    "WR": 195,
    "RB": 200,
    "TE": 120,
    "K": 140,
    "DEF": 140,
    "D": 140,
    "DB": 140,
    "DL": 140,
    "LB": 140,
    "DT": 140,
    "DE": 140,
    "CB": 140,
    "S": 140,
    "BN": 0,
    "IR": 0
};

function calculateMean(positions, numTeams) {
    var positionCounts = {};
    for (var position in positionValues) {
        positionCounts[position] = 0;
    }

    for (var i = 0; i < positions.length; i++) {
        var curPosition = positions[i];
        var curPositionName = curPosition.position;
        if (!(curPositionName in positionValues)) {
            curPositionName = getFlexPositionEquivalent(curPositionName);
        }
        positionCounts[curPositionName] += curPosition.count;
    }

    var mean = 0;
    for (var position in positionCounts) {
        mean += getPositionValue(position, positionCounts[position]);
    }
    mean -= numTeams - 10; // leagues with more teams have lower scoring
    return mean;
}

function getFlexPositionEquivalent(positionName) {
    if (positionName == "Q/W/R/T") {
        return "QB";
    }
    return "WR";
}

function getPositionValue(positionName, count) {
    var result = 0;
    for (var i = 1; i <= count; i++) {
        result += 1 / math.sqrt(i) * positionValues[positionName]; // diminishing returns for multiple players of same position
    }
    return result / 16; // adjust for 1 week instead of full season
}

/**
 * @api{get} /league/:league_key/teams?token=:token GetLeagueTeams
 * @apiGroup League
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {String} name The name of the team.
 * @apiSuccess {String} logo_url The url of the team's logo.
 */
router.get('/:league_key/teams', function (req, res) {
    var yf = auth.getYF(req.query.token);
    var leagueKey = req.params.league_key;

    yf.league.teams(
        leagueKey,
        (err, data) => parseTeamsResult(res, err, data)
    );
});

function parseTeamsResult(res, err, data) {
    if (err) {
        res.status(400).json(err);
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

        res.status(200).json(result);
    }
}

module.exports = router;
