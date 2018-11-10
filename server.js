var tokens = require('./tokens.js');
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

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: "https://api.login.yahoo.com/oauth2/request_auth",
            tokenURL: "https://api.login.yahoo.com/oauth2/get_token",
            clientID: APP_KEY,
            clientSecret: APP_SECRET,
            callbackURL:
                tokens.appUrl() + "/auth/callback"
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

                    console.log(userObj);

                    app.yf.setUserToken(accessToken);

                    return done(null, userObj);
                }
            });
        }
    )
);

var app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.yf = new YahooFantasy(APP_KEY, APP_SECRET);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: "ok",
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
        res.redirect(req.session.redirect || "/");
    }
);

app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

app.listen(3000);

module.exports = app;
