const tokens = require('../power-rankings/src/tokens.js');
const express = require('express');
const passport = require('passport');
const request = require("request");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const OAuth2Strategy = require("passport-oauth2");
const YahooFantasy = require("yahoo-fantasy");
const cors = require('cors');

const APP_KEY = tokens.yahooConsumerKey();
const APP_SECRET = tokens.yahooConsumerSecret();

const authRoute = require('./auth');
const userRoute = require('./user');
const leagueRoute = require('./league');
const scoresRoute = require('./scores');
const rankingsRoute = require('./rankings');

var app = express();
app.use(cors());

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
                    app.yf.setUserToken(accessToken);

                    return done(null, accessToken);
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
app.use(passport.initialize());
app.use(passport.session());
app.disable("view cache");

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/league', leagueRoute);
app.use('/scores', scoresRoute);
app.use('/rankings', rankingsRoute);

app.listen(5000);

module.exports = app;
