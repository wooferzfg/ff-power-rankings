const tokens = require('../power-rankings/src/tokens.js');
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get(
    "/yahoo",
    passport.authenticate("oauth2", { failureRedirect: "/" }),
    function (req, res, user) {
        res.redirect("/");
    }
);

router.get(
    "/callback",
    passport.authenticate("oauth2", { failureRedirect: "/" }),
    function (req, res) {
        res.redirect(tokens.clientUrl() + "/leagues");
    }
);

module.exports = router;
