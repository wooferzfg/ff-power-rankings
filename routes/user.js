const express = require('express');
const router = express.Router();

/**
 * @api{get} /leagues GetLeaguesForUser
 * @apiGroup User
 * 
 * @apiSuccess {String} league_key The key for a league.
 * @apiSuccess {String} name The name of the league.
 * @apiSuccess {String} season The year/season that the league was a part of.
 */
router.get('/leagues', function (req, res) {
    var yf = req.app.yf;

    yf.user.games(
        (err, data) => parseGamesResult(yf, res, err, data)
    );
});

function parseGamesResult(yf, res, err, data) {
    if (err) {
        res.send(err);
    } else {
        var games = [];
        var gamesData = data["games"];
        for (var i = 0; i < gamesData.length; i++) {
            var curGameData = gamesData[i];
            if (curGameData["code"] == "nfl") {
                games.push(curGameData["game_key"]);
            }
        }
        var gameKeys = games.join();

        yf.user.game_leagues(
            gameKeys,
            (err, data) => parseLeaguesResult(res, err, data)
        )
    }
}

function parseLeaguesResult(res, err, data) {
    if (err) {
        res.send(err);
    } else {
        var result = [];

        var gamesData = data["games"];
        for (var i = 0; i < gamesData.length; i++) {
            var curGameData = gamesData[i];
            var leaguesData = curGameData["leagues"];
            for (var j = 0; j < leaguesData.length; j++) {
                var curLeagueData = leaguesData[j][0];
                var leagueResult = {};
                leagueResult["league_key"] = curLeagueData["league_key"];
                leagueResult["name"] = curLeagueData["name"];
                leagueResult["season"] = curLeagueData["season"];
                result.push(leagueResult);
            }
        }
        result.sort(function (a, b) {
            return a["season"] - b["season"];
        })

        res.send(result);
    }
}

module.exports = router;
