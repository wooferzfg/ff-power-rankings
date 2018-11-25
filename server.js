const tokens = require('./power-rankings/src/tokens.js');
const express = require('express');
const path = require("path");
const passport = require('passport');
const request = require("request");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const OAuth2Strategy = require("passport-oauth2");
const YahooFantasy = require("yahoo-fantasy");
const cors = require('cors');

const APP_KEY = tokens.yahooConsumerKey();
const APP_SECRET = tokens.yahooConsumerSecret();

const userRoute = require('./routes/user');
const leagueRoute = require('./routes/league');
const scoresRoute = require('./routes/scores');
const rankingsRoute = require('./routes/rankings');

var app = express();
app.use(cors());
app.use('/user', userRoute);
app.use('/league', leagueRoute);
app.use('/scores', scoresRoute);
app.use('/rankings', rankingsRoute);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Authentication code from: https://github.com/whatadewitt/yahoofantasysandbox/blob/master/app.js

passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: "https://api.login.yahoo.com/oauth2/request_auth",
            tokenURL: "https://api.login.yahoo.com/oauth2/get_token",
            clientID: APP_KEY,
            clientSecret: APP_SECRET,
            callbackURL:
                tokens.serverUrl() + "/auth/callback"
        },
        function (accessToken, refreshToken, params, profile, done) {
            var options = {
                url:
                    "https://social.yahooapis.com/v1/user/" +
                    params.xoauth_yahoo_guid +
                    "/profile?format=json",
                method: "get",
                json: true,
                auth: {
                    bearer: accessToken
                }
            };

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var userObj = {
                        id: body.profile.guiid,
                        name: body.profile.nickname,
                        avatar: body.profile.image.imageUrl,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    };

                    app.yf.setUserToken(accessToken);

                    return done(null, userObj);
                }
            });
        }
    )
);

app.yf = new YahooFantasy(APP_KEY, APP_SECRET);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: tokens.sessionSecret(),
        resave: false,
        saveUninitialized: true
    })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
app.disable("view cache");

app.get(
    "/auth/yahoo",
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
    function (req, res, user) {
        res.redirect("/");
    }
);

app.get(
    "/auth/callback",
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
    function (req, res) {
        res.redirect(tokens.clientUrl() + "/leagues");
    }
);

app.listen(5000);

module.exports = app;
