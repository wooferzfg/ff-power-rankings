const scores = require('./scores');
const auth = require('./auth');
const express = require('express');
const router = express.Router();
const math = require('mathjs');
const gaussian = require('gaussian');

/**
 * @api{get} /rankings/:league_key/:week?token=:token GetRankingsForWeek
 * @apiGroup Rankings
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {Number} week The week number to get rankings for. If the parameter is "5", the rankings will include data from weeks 1 through 5.
 * @apiParam {Number} expected_mean The expected mean scoring for each team in each week of the season.
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {Number} win_percentage The weighted win percentage based on the power rankings formula.
 * @apiSuccess {Number} change The change in rank from the previous week to the current week. A positive number means that the team has improved its rank.
 */
router.get('/:league_key/:week/:expected_mean', function (req, res) {
    var yf = auth.getYF(req.query.token);
    var leagueKey = req.params.league_key;
    var week = parseInt(req.params.week);
    var expectedMean = Number(req.params.expected_mean);
    scores.getScores(yf, leagueKey, week, res, data => {
        powerRankings(week, res, data, true, expectedMean);
    });
});

/**
 * @api{get} /rankings/:league_key/:week/unweighted?token=:token GetUnweightedRankingsForWeek
 * @apiGroup Rankings
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {Number} week The week number to get rankings for. If the parameter is "5", the rankings will include data from weeks 1 through 5.
 * @apiParam {Number} expected_mean The expected mean scoring for each team in each week of the season.
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {Number} win_percentage The weighted win percentage based on the power rankings formula.
 * @apiSuccess {Number} change The change in rank from the previous week to the current week. A positive number means that the team has improved its rank.
 */
router.get('/:league_key/:week/:expected_mean/unweighted', function (req, res) {
    var yf = auth.getYF(req.query.token);
    var leagueKey = req.params.league_key;
    var week = parseInt(req.params.week);
    var expectedMean = Number(req.params.expected_mean);
    scores.getScores(yf, leagueKey, week, res, data => {
        powerRankings(week, res, data, false, expectedMean);
    });
});

/**
 * @api{get} /rankings/:league_key/:week/all?token=:token GetAllRankingsUpToWeek
 * @apiGroup Rankings
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {Number} week The last week number to get rankings for. If the parameter is "5", there will be rankings for weeks 1 through 5.
 * @apiParam {Number} expected_mean The expected mean scoring for each team in each week of the season.
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {Number} win_percentage The weighted win percentage based on the power rankings formula.
 */
router.get('/:league_key/:week/:expected_mean/all', function (req, res) {
    var yf = auth.getYF(req.query.token);
    var leagueKey = req.params.league_key;
    var week = parseInt(req.params.week);
    var expectedMean = Number(req.params.expected_mean);
    scores.getScores(yf, leagueKey, week, res, data => {
        var result = [];
        for (var i = 1; i <= week; i++) {
            var curWeek = calculateRankings(i, data, true, expectedMean);
            result.push(curWeek);
        }
        res.status(200).send(result);
    });
});

/**
 * @api{get} /rankings/:league_key/:week/details/:team_id?token=:token GetDetailsForTeam
 * @apiGroup Rankings
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {Number} week The last week number to get rankings for. If the parameter is "5", there will be rankings for weeks 1 through 5.
 * @apiParam {Number} expected_mean The expected mean scoring for each team in each week of the season.
 * @apiParam {String} team_id The id of the team within the league.
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {Number} week The week number that this data pertains to.
 * @apiSuccess {Number} points The number of points that the team scored during the given week.
 * @apiSuccess {Number} wins The likelihood of a win during this week, in the form of a number from 0 to 1.
 * @apiSuccess {Number} ratio The weight of this week relative to the combined weight of all the weeks.
 */
router.get('/:league_key/:week/:expected_mean/details/:team_id', function (req, res) {
    var yf = auth.getYF(req.query.token);
    var leagueKey = req.params.league_key;
    var week = parseInt(req.params.week);
    var expectedMean = Number(req.params.expected_mean);
    var teamID = req.params.team_id;
    scores.getScores(yf, leagueKey, week, res, data => {
        var scoresDict = getScoresDict(week, data);
        const distribution = getDistribution(week, data, true, expectedMean);
        var result = [];
        for (var i = 1; i <= week; i++) {
            var curScore = scoresDict[i][teamID];
            var curWins = distribution.cdf(curScore);
            var curRatio = getWeekRatio(i, week, true);
            result.push({
                week: i,
                points: curScore,
                wins: curWins,
                ratio: curRatio
            });
        }
        res.status(200).send(result);
    });
});

/**
 * historical data has a standard deviation of 22
 * inverse cdf with an area of 0.975 results in an sd of 49
 * 
 * most teams in the power rankings end up between 0.250 and 0.750
 * inverse cdf with an area of 0.5 has a z-score of 0.674
 * this gives us an sd = 49 / 0.674 = 73
 * 
 * 22^2*0.667 + prior_sd^2*0.333 = 73^2
 * prior_sd = 123
 * 
 * prior_variance = 123^2 = 15129
 */
const PRIOR_VARIANCE = 15129;

function powerRankings(week, res, data, weighted, expected_mean) {
    var curWeek = calculateRankings(week, data, weighted, expected_mean);
    if (week > 1) {
        var prevWeek = calculateRankings(week - 1, data, weighted, expected_mean);
    }

    for (var i = 0; i < curWeek.length; i++) {
        var curElement = curWeek[i];
        if (prevWeek) {
            var curRank = i + 1;
            var team_id = curElement.team_id;
            var prevRank = getRankOfTeam(prevWeek, team_id);
            var change = prevRank - curRank;
        } else {
            var change = 0;
        }
        curElement.change = change;
    }

    res.status(200).send(curWeek);
}

function getRankOfTeam(rankings, team_id) {
    for (var i = 0; i < rankings.length; i++) {
        var curElement = rankings[i];
        if (curElement.team_id == team_id) {
            return i + 1;
        }
    }
}

function calculateRankings(maxWeek, data, weighted, expected_mean) {
    var scoresDict = getScoresDict(maxWeek, data);
    const distribution = getDistribution(maxWeek, data, weighted, expected_mean);

    var result = {};
    for (var i = 1; i <= maxWeek; i++) {
        var curRatio = getWeekRatio(i, maxWeek, weighted);

        for (team_id in scoresDict[i]) {
            if (i == 1) {
                result[team_id] = 0; // initialize result to 0 before we add to it
            }

            var curScore = scoresDict[i][team_id];
            var curWins = distribution.cdf(curScore);

            result[team_id] += curWins * curRatio;
        }
    }

    var sortedResult = [];
    for (var team_id in result) {
        var curWinPercentage = result[team_id];
        sortedResult.push({ team_id: team_id, win_percentage: curWinPercentage });
    }
    sortedResult.sort(function (a, b) {
        return b.win_percentage - a.win_percentage;
    });

    return sortedResult;
}

function getScoresDict(maxWeek, data) {
    var scoresDict = {}
    for (var i = 1; i <= maxWeek; i++) {
        scoresDict[i] = {};
    }

    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        var curWeek = element.week;
        if (curWeek <= maxWeek) {
            var curPoints = element.points;
            scoresDict[curWeek][element.team_id] = curPoints;
        }
    }

    return scoresDict;
}

function getDistribution(maxWeek, data, weighted, expected_mean) {
    var allScores = []
    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        var curWeek = element.week;
        if (curWeek <= maxWeek) {
            var curPoints = element.points;
            allScores.push(curPoints);
        }
    }

    const meanPriorRatio = getMeanPriorRatio(maxWeek, weighted);
    const variancePriorRatio = getVariancePriorRatio(maxWeek, weighted);
    const curMean = math.mean(allScores);
    const curSD = math.std(allScores);
    const mean = interpolate(curMean, expected_mean, meanPriorRatio);
    const variance = interpolate(curSD * curSD, PRIOR_VARIANCE, variancePriorRatio);

    return gaussian(mean, variance);
}

function getMeanPriorRatio(week, weighted) {
    if (weighted) {
        // 0.7, 0.49, 0.343, etc.
        return math.pow(0.7, week);
    }
    return 0; // don't use prior for standings
}

function getVariancePriorRatio(week, weighted) {
    if (weighted) {
        // 0.333, 0.125, 0.067, etc.
        return 1 / ((week + 2) * week);
    }
    return 0; // don't use prior for standings   
}

function interpolate(current, prior, priorRatio) {
    // linear interpolation between current and prior
    // priorRatio is between 0 and 1
    // 0 means to only use current, 1 means to only use prior
    return current * (1 - priorRatio) + prior * priorRatio;
}

function getWeekRatio(week, totalWeeks, weighted) {
    // the ratio of the week's weight to the total weight of all weeks
    var totalWeight = 0;
    for (var i = 1; i <= totalWeeks; i++) {
        var curWeight = getWeekWeight(i, totalWeeks, weighted);
        totalWeight += curWeight;
        if (i == week) {
            var myWeight = curWeight;
        }
    }
    return myWeight / totalWeight;
}

function getWeekWeight(week, totalWeeks, weighted) {
    if (weighted) {
        // 1/3 for the most recent week
        // 1/4 for the second most recent week
        // etc.
        return 1 / (totalWeeks - week + 3);
    }
    return 1; // all weeks weighted equally for standings
}

module.exports = router;
