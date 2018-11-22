const scores = require('./scores');
const express = require('express');
const router = express.Router();

router.get('/:league_key/:up_to_week', function (req, res) {
    var yf = req.app.yf;
    var leagueKey = req.params.league_key;
    var upToWeek = parseInt(req.params.up_to_week);
    scores.getScores(yf, leagueKey, upToWeek, res, result => {
        powerRankings(upToWeek, res, result);
    });
});

function powerRankings(upToWeek, res, data) {
    var curWeek = calculateRankings(upToWeek, data);
    /*if (upToWeek > 1) {
        var prevWeek = calculateRankings(upToWeek - 1, data);
    }*/
}

function calculateRankings(upToWeek, data) {

}

module.exports = router;
