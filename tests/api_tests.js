// mocha tests/api_tests.js --token=AAAAAA 

var tokens = require('../power-rankings/src/tokens.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var chaiAlmost = require('chai-almost');
var token = require('minimist')(process.argv.slice(2)).token;

require('chai').should();
chai.use(chaiHttp);
chai.use(chaiAlmost(0.001));

var server = tokens.serverUrl();
var league = "380.l.102172";
var expectedMean = 90;

describe('User tests', function () {
    this.timeout(20000);

    it("should list all of a user's leagues", function (done) {
        chai.request(server)
            .get(`/user/leagues?token=${token}`)
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
    this.timeout(20000);

    it("should list all of the scores for a league", function (done) {
        chai.request(server)
            .get(`/scores/${league}/2?token=${token}`)
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
    this.timeout(20000);

    it("should list the settings for a league", function (done) {
        chai.request(server)
            .get(`/league/${league}/settings?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Object');
                res.body.should.have.property("name");
                res.body.should.have.property("season");
                res.body.should.have.property("num_teams");
                res.body.should.have.property("current_week");
                res.body.should.have.property("total_weeks");
                res.body.should.have.property("expected_mean");
                (err === null).should.equal(true);
                done();
            });
    });

    it("should list all the teams in a league", function (done) {
        chai.request(server)
            .get(`/league/${league}/teams?token=${token}`)
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

describe('Rankings tests', function () {
    this.timeout(20000);

    it("should return power rankings", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/1/${expectedMean}?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(12);
                res.body.should.have.nested.property("[0].team_id");
                res.body.should.have.nested.property("[0].win_percentage");
                res.body.should.have.nested.property("[0].change");
                (err === null).should.equal(true);
                done();
            });
    });

    it("should show no change for first week", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/1/${expectedMean}?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');

                for (var i = 0; i < res.body.length; i++) {
                    (res.body[i].change).should.equal(0);
                }

                (err === null).should.equal(true);
                done();
            });
    });

    it("changes should add up to 0", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/5/${expectedMean}?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');

                var totalChange = 0;
                for (var i = 0; i < res.body.length; i++) {
                    totalChange += res.body[i].change;
                }
                totalChange.should.equal(0);

                (err === null).should.equal(true);
                done();
            });
    });

    it("should show correct changes", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/3/${expectedMean}?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');

                res.body[0].change.should.equal(1);
                res.body[1].change.should.equal(2);
                res.body[2].change.should.equal(0);
                res.body[3].change.should.equal(-3);
                res.body[4].change.should.equal(3);
                res.body[5].change.should.equal(1);
                res.body[6].change.should.equal(4);
                res.body[7].change.should.equal(-3);
                res.body[8].change.should.equal(-3);
                res.body[9].change.should.equal(-1);
                res.body[10].change.should.equal(-1);
                res.body[11].change.should.equal(0);

                (err === null).should.equal(true);
                done();
            });
    });

    it("should show correct win percentages", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/4/${expectedMean}?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');

                res.body[0].win_percentage.should.almost.equal(0.693);
                res.body[1].win_percentage.should.almost.equal(0.670);
                res.body[2].win_percentage.should.almost.equal(0.654);
                res.body[3].win_percentage.should.almost.equal(0.598);
                res.body[4].win_percentage.should.almost.equal(0.583);
                res.body[5].win_percentage.should.almost.equal(0.542);
                res.body[6].win_percentage.should.almost.equal(0.510);
                res.body[7].win_percentage.should.almost.equal(0.507);
                res.body[8].win_percentage.should.almost.equal(0.482);
                res.body[9].win_percentage.should.almost.equal(0.432);
                res.body[10].win_percentage.should.almost.equal(0.366);
                res.body[11].win_percentage.should.almost.equal(0.188);

                (err === null).should.equal(true);
                done();
            });
    });

    it("should show correct teams", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/2/${expectedMean}?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');

                res.body[0].team_id.should.equal('12');
                res.body[1].team_id.should.equal('1');
                res.body[2].team_id.should.equal('5');
                res.body[3].team_id.should.equal('7');
                res.body[4].team_id.should.equal('4');
                res.body[5].team_id.should.equal('8');
                res.body[6].team_id.should.equal('6');
                res.body[7].team_id.should.equal('2');
                res.body[8].team_id.should.equal('9');
                res.body[9].team_id.should.equal('3');
                res.body[10].team_id.should.equal('11');
                res.body[11].team_id.should.equal('10');

                (err === null).should.equal(true);
                done();
            });
    });

    it("should show all rankings correctly", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/4/${expectedMean}/all?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(4);
                res.body[0].length.should.be.eql(12);
                res.body.should.have.nested.property("[0].[0].team_id");
                res.body.should.have.nested.property("[0].[0].win_percentage");

                (err === null).should.equal(true);
                done();
            });
    });

    it("should show unweighted rankings correctly", function (done) {
        chai.request(server)
            .get(`/rankings/${league}/4/${expectedMean}/unweighted?token=${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');

                res.body[0].win_percentage.should.almost.equal(0.739);
                res.body[1].win_percentage.should.almost.equal(0.724);
                res.body[2].win_percentage.should.almost.equal(0.630);
                res.body[3].win_percentage.should.almost.equal(0.599);
                res.body[4].win_percentage.should.almost.equal(0.559);
                res.body[5].win_percentage.should.almost.equal(0.544);
                res.body[6].win_percentage.should.almost.equal(0.481);
                res.body[7].win_percentage.should.almost.equal(0.468);
                res.body[8].win_percentage.should.almost.equal(0.449);
                res.body[9].win_percentage.should.almost.equal(0.388);
                res.body[10].win_percentage.should.almost.equal(0.297);
                res.body[11].win_percentage.should.almost.equal(0.089);

                (err === null).should.equal(true);
                done();
            });
    });
});
