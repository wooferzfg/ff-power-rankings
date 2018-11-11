const express = require('express');
const router = express.Router();

router.get('/games', function (req, res) {
    var yf = req.app.yf;

    yf.user.games(
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        }
    );
});

router.get('/games/:gameId/leagues', function (req, res) {
    var yf = req.app.yf;
    var game = req.params.gameId;

    yf.user.game_leagues(
        game,
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        }
    )
});

module.exports = router;
