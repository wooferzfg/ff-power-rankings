const express = require('express');
const router = express.Router();

router.get('/:leagueKey', function (req, res) {
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

module.exports = router;
