const tokens = require('../power-rankings/src/tokens.js');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const YahooFantasy = require("yahoo-fantasy");

/**
 * @api{get} /yahoo GetYahooAccessToken
 * @apiGroup Auth
 * @apiVersion 1.0.0
 */
router.get(
    "/yahoo",
    function (req, res) {
        passport.authenticate("oauth2")(req, res);
    }
);

/**
 * @api{get} /callback?code=:code YahooAccessTokenCallback
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} code The code to be used for retrieving the access token.
 */
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
