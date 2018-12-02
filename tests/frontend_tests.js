var webdriver = require('selenium-webdriver');
require('chromedriver');
require('chai').should();
var chromeCapabilities = webdriver.Capabilities.chrome();
var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

describe('Login', function () {
    it('should show the correct page title', function (done) {
        this.timeout(30000);
        driver.get('http://localhost:3000')
            .then(() => driver.getTitle())
            .then(title => title.should.equal("Yahoo Fantasy Football Power Rankings"))
            .then(() => done())
            .catch(error => done(error));
    });
});
