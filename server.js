var tokens = require('./power-rankings/src/tokens.js');
var express = require('express');
var path = require("path");
var passport = require('passport');
var request = require("request");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var OAuth2Strategy = require("passport-oauth2");
var YahooFantasy = require("yahoo-fantasy");

var APP_KEY = tokens.yahooConsumerKey();
var APP_SECRET = tokens.yahooConsumerSecret();

var userRoute = require('./routes/user');
var scores = require('./routes/scores');

var app = express();
app.use('/user', userRoute);
app.use('/scores', scores);

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
        res.redirect(tokens.clientUrl() + "/rankings");
    }
);

app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

app.listen(5000);

module.exports = app;
