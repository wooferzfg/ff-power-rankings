// mocha tests/frontend_tests.js

var tokens = require('../power-rankings/src/tokens.js');
var webdriver = require('selenium-webdriver');
require('chromedriver');
require('chai').should();
var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
    'args': [`--user-data-dir=${tokens.chromeUserData()}`, '--disable-dev-shm-usage', '--no-sandbox']
};
chromeCapabilities.set('chromeOptions', chromeOptions);
var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

function findButton(text) {
    return driver.findElements(webdriver.By.xpath(`//*[(self::a or self::button) and contains(text(),'${text}')]`)).then(function (result) {
        return result[0];
    });
}

function findByCSS(css, index) {
    return driver.findElements(webdriver.By.css(css)).then(function (result) {
        return result[index];
    });
}

function logIn() {
    return driver.get('http://localhost:3000')
        .then(() => findButton('Log In With Yahoo'), 2000)
        .then(button => button.click())
        .then(() => findButton('Agree'), 2000)
        .then(button => button.click())
}

describe('Front-end tests', function () {
    this.timeout(90000);

    it('should show the correct page title', function (done) {
        driver.get('http://localhost:3000')
            .then(() => driver.getTitle())
            .then(title => title.should.equal("Yahoo Fantasy Football Power Rankings"))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you login', function (done) {
        logIn()
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/leagues'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you choose a league', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/rankings'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should show rankings', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.team-name', 0))
            .then(team_name => team_name.getText())
            .then(team_name => team_name.should.equal('Clown Question Bro'))
            .then(() => findByCSS('.win-percentage', 0))
            .then(win_percentage => win_percentage.getText())
            .then(win_percentage => win_percentage.should.equal('.653'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you switch weeks', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(10000))
            .then(() => findButton('1'))
            .then(weekButton => weekButton.click())
            .then(() => driver.sleep(8000))
            .then(() => findByCSS('.team-name', 0))
            .then(team_name => team_name.getText())
            .then(team_name => team_name.should.equal('Kryptonite'))
            .then(() => findByCSS('.win-percentage', 0))
            .then(win_percentage => win_percentage.getText())
            .then(win_percentage => win_percentage.should.equal('.726'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you view rankings details', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.rankings-row', 0))
            .then(rankings_row => rankings_row.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/details'))
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.wins-text', 0))
            .then(wins_text => wins_text.getText())
            .then(wins_text => wins_text.should.equal('.699'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you switch to the graph view', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(2000))
            .then(() => findButton('Graph'))
            .then(graphButton => graphButton.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/graph'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you switch to the standings view', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(2000))
            .then(() => findButton('Standings'))
            .then(graphButton => graphButton.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/standings'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you go back to the rankings page', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(2000))
            .then(() => findButton('Graph'))
            .then(graphButton => graphButton.click())
            .then(() => driver.sleep(2000))
            .then(() => findButton('Rankings'))
            .then(rankingsButton => rankingsButton.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/rankings'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you switch to the data view', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(2000))
            .then(() => findButton('Data'))
            .then(dataButton => dataButton.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/data'))
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.team-label', 0))
            .then(teamLabel => teamLabel.click())
            .then(() => findByCSS('.score', 0))
            .then(scoreText => scoreText.getText())
            .then(scoreText => scoreText.should.equal('54'))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you go back to the leagues page', function (done) {
        logIn()
            .then(() => driver.sleep(20000))
            .then(() => findByCSS('.league a', 0))
            .then(league => league.click())
            .then(() => driver.sleep(2000))
            .then(() => findButton('Back to Leagues'))
            .then(leaguesButton => leaguesButton.click())
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/leagues'))
            .then(() => done())
            .catch(error => done(error));
    });
});
