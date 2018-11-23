const scores = require('./scores');
const express = require('express');
const router = express.Router();
const math = require('mathjs');
const gaussian = require('gaussian');

/**
 * @api{get} /rankings/:league_key/:week GetRankingsForWeek
 * @apiGroup Rankings
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} league_key The key for a league. Should be in the form "123.l.123456".
 * @apiParam {Number} week The week number to get rankings for. If the parameter is "5", the rankings will include data from weeks 1 through 5.
 * 
 * @apiSuccess {String} team_id The id of the team within the league.
 * @apiSuccess {Number} win_percentage The weighted win percentage based on the power rankings formula.
 * @apiSuccess {Number} change The change in rank from the previous week to the current week. A positive number means that the team has improved its rank.
 */
router.get('/:league_key/:week', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;
    var week = parseInt(req.params.week);
    scores.getScores(yf, leagueKey, week, res, result => {
        powerRankings(week, res, result);
    });
});

// based on historical data
const HISTORICAL_MEAN = 90;

/**
 * historical data has a standard deviation of 22
 * inverse cdf with an area of 0.975 results in an sd of 49
 * 
 * most teams in the power rankings end up between 0.250 and 0.750
 * inverse cdf with an area of 0.5 has a z-score of 0.674
 * this gives us an sd = 49 / 0.674 = 73
 * 
 * 22^2*0.667 + historical_sd^2*0.333 = 73^2
 * historical_sd = 123
 * 
 * historical_variance = 123^2 = 15129
 */
const HISTORICAL_VARIANCE = 15129;

function powerRankings(week, res, data) {
    var curWeek = calculateRankings(week, data);
    if (week > 1) {
        var prevWeek = calculateRankings(week - 1, data);
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

function calculateRankings(maxWeek, data) {
    allScores = []
    scoresDict = {}
    for (var i = 1; i <= maxWeek; i++) {
        scoresDict[i] = {};
    }

    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        var curWeek = element.week;
        if (curWeek <= maxWeek) {
            var curPoints = element.points;
            allScores.push(curPoints);
            scoresDict[curWeek][element.team_id] = curPoints;
        }
    }

    const meanPriorRatio = getMeanPriorRatio(maxWeek);
    const variancePriorRatio = getVariancePriorRatio(maxWeek);
    const curMean = math.mean(allScores);
    const curSD = math.std(allScores);
    const mean = interpolate(curMean, HISTORICAL_MEAN, meanPriorRatio);
    const variance = interpolate(curSD * curSD, HISTORICAL_VARIANCE, variancePriorRatio);
    const distribution = gaussian(mean, variance);

    var result = {};
    for (var i = 1; i <= maxWeek; i++) {
        var curRatio = getWeekRatio(i, maxWeek);

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

function getMeanPriorRatio(week) {
    // 0.7, 0.49, 0.343, etc.
    return math.pow(0.7, week);
}

function getVariancePriorRatio(week) {
    // 0.333, 0.125, 0.067, etc.
    return 1 / ((week + 2) * week);
}

function interpolate(current, historical, priorRatio) {
    // linear interpolation between current and historical
    // priorRatio is between 0 and 1
    // 0 means to only use current, 1 means to only use historical
    return current * (1 - priorRatio) + historical * priorRatio;
}

function getWeekRatio(week, totalWeeks) {
    // the ratio of the week's weight to the total weight of all weeks
    var totalWeight = 0;
    for (var i = 1; i <= totalWeeks; i++) {
        var curWeight = getWeekWeight(i, totalWeeks);
        totalWeight += curWeight;
        if (i == week) {
            var myWeight = curWeight;
        }
    }
    return myWeight / totalWeight;
}

function getWeekWeight(week, totalWeeks) {
    // 1/3 for the most recent week
    // 1/4 for the second most recent week
    // etc.
    return 1 / (totalWeeks - week + 3);
}

module.exports = router;
