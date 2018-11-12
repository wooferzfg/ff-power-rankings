var tokens = require('../power-rankings/src/tokens.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
require('chai').should();

var server = tokens.serverUrl();
var league = "380.l.102172";

chai.use(chaiHttp);

describe('User tests', function () {
    it("should list all of a user's leagues", function (done) {
        this.timeout(20000);
        chai.request(server)
            .get('/user/leagues')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.should.have.nested.property("[0].league_key");
                res.body.should.have.nested.property("[0].name");
                res.body.should.have.nested.property("[0].season");
                (err === null).should.equal(true);
                done();
            });
    });
});

describe('Scores tests', function () {
    it("should list all of the scores for a league", function (done) {
        this.timeout(20000);
        chai.request(server)
            .get('/scores/' + league + "/2")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(24);
                res.body.should.have.nested.property("[0].team_id");
                res.body.should.have.nested.property("[0].week");
                res.body.should.have.nested.property("[0].points");
                (err === null).should.equal(true);
                done();
            });
    });
});

describe('League tests', function () {
    it("should list the settings for a league", function (done) {
        this.timeout(20000);
        chai.request(server)
            .get('/league/' + league + "/settings")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Object');
                res.body.should.have.property("name");
                res.body.should.have.property("season");
                res.body.should.have.property("num_teams");
                res.body.should.have.property("current_week");
                res.body.should.have.property("total_weeks");
                (err === null).should.equal(true);
                done();
            });
    });

    it("should list all the teams in a league", function (done) {
        this.timeout(20000);
        chai.request(server)
            .get('/league/' + league + "/teams")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(12);
                res.body.should.have.nested.property("[0].team_id");
                res.body.should.have.nested.property("[0].name");
                res.body.should.have.nested.property("[0].logo_url");
                (err === null).should.equal(true);
                done();
            });
    });
});
