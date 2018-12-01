const tokens = require('../power-rankings/src/tokens.js');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const YahooFantasy = require("yahoo-fantasy");

router.get(
    "/yahoo",
    function (req, res) {
        passport.authenticate("oauth2")(req, res);
    }
);

router.get(
    "/callback",
    function (req, res) {
        passport.authenticate("oauth2", function (err, user, info) {
            res.redirect(tokens.clientUrl() + "/leagues?token=" + user);
        })(req, res);
    }
);

function getYF(accessToken) {
    var yf = new YahooFantasy(tokens.yahooConsumerKey(), tokens.yahooConsumerSecret());
    yf.setUserToken(accessToken);
    return yf;
}

router.getYF = getYF;
module.exports = router;
