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

function logIn() {
    return driver.get('http://localhost:3000')
        .then(() => driver.wait(findButton('Log In With Yahoo'), 2000))
        .then(button => button.click())
        .then(() => driver.wait(findButton('Agree'), 2000))
        .then(button => button.click())
}

describe('Login', function () {
    it('should show the correct page title', function (done) {
        this.timeout(30000);
        driver.get('http://localhost:3000')
            .then(() => driver.getTitle())
            .then(title => title.should.equal("Yahoo Fantasy Football Power Rankings"))
            .then(() => done())
            .catch(error => done(error));
    });

    it('should let you login', function (done) {
        this.timeout(30000);
        logIn()
            .then(() => driver.getCurrentUrl())
            .then(url => url.should.include('/leagues'))
            .then(() => done())
            .catch(error => done(error));
    });
});
