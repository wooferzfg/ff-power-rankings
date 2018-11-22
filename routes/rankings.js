const scores = require('./scores');
const express = require('express');
const router = express.Router();
const math = require('mathjs');
const gaussian = require('gaussian');

router.get('/:league_key/:up_to_week', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;
    var upToWeek = parseInt(req.params.up_to_week);
    scores.getScores(yf, leagueKey, upToWeek, res, result => {
        powerRankings(upToWeek, res, result);
    });
});

const HISTORICAL_MEAN = 90;
const HISTORICAL_SD = 25;

function powerRankings(upToWeek, res, data) {
    var curWeek = calculateRankings(upToWeek, data);
    /*if (upToWeek > 1) {
        var prevWeek = calculateRankings(upToWeek - 1, data);
    }*/
    res.status(200).send(data);
}

function calculateRankings(upToWeek, data) {
    allScores = []
    scoresDict = {}
    for (var i = 1; i <= upToWeek; i++) {
        scoresDict[i] = {};
    }

    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        var curPoints = element.points;
        allScores.push(curPoints);
        scoresDict[element.week][element.team_id] = curPoints;
    }

    const priorRatio = getPriorRatio(upToWeek);
    const curMean = math.mean(allScores);
    const curSD = math.std(allScores);
    const mean = interpolate(curMean, HISTORICAL_MEAN, priorRatio);
    const sd = interpolate(curSD, HISTORICAL_SD, priorRatio);
    var distribution = gaussian(mean, sd * sd);

    var result = {};
    for (var i = 1; i <= upToWeek; i++) {
        var curRatio = getWeekRatio(i, upToWeek);

        for (team_id in scoresDict[i]) {
            if (i == 1) {
                result[team_id] = 0; // initialize result to 0 before we add to it
            }

            var curScore = scoresDict[i][team_id];
            var curWins = distribution.cdf(curScore);

            result[team_id] += curWins * curRatio;
        }
    }

    console.log(result);
}

function getPriorRatio(week) {
    return math.pow(0.7, week);
}

function interpolate(current, historical, priorRatio) {
    return current * (1 - priorRatio) + historical * priorRatio;
}

function getWeekRatio(week, totalWeeks) {
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
