const auth = require('./auth');
const express = require('express');
const router = express.Router();

/**
 * @api{get} /user/leagues?token=:token GetLeaguesForUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} token The Yahoo API token.
 * 
 * @apiSuccess {String} league_key The key for a league.
 * @apiSuccess {String} name The name of the league.
 * @apiSuccess {Number} season The year/season that the league was a part of.
 */
router.get('/leagues', function (req, res) {
    var yf = auth.getYF(req.query.token);

    yf.user.game_leagues_for_game_code(
        'nfl',
        (err, data) => parseLeaguesResult(res, err, data)
    )
});

function parseLeaguesResult(res, err, data) {
    if (err) {
        res.status(400).json(err);
    } else {
        var result = [];

        var gamesData = data["games"];
        for (var i = 0; i < gamesData.length; i++) {
            var curGameData = gamesData[i];
            var curSeason = parseInt(curGameData["season"]);
            if (curSeason >= 2013) {
                var leaguesData = curGameData["leagues"];
                for (var j = 0; j < leaguesData.length; j++) {
                    var curLeagueData = leaguesData[j][0];
                    var leagueResult = {};
                    leagueResult["league_key"] = curLeagueData["league_key"];
                    leagueResult["name"] = curLeagueData["name"];
                    leagueResult["season"] = parseInt(curLeagueData["season"]);
                    result.push(leagueResult);
                }
            }
        }

        res.status(200).json(result);
    }
}

module.exports = router;
