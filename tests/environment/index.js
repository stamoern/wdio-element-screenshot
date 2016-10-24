'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');

// WebDriver
global.browser = require('webdriverio').remote({
    desiredCapabilities: {
        browserName: 'firefox'
    }
});

// Assertions
chai.use(chaiAsPromised);
global.assert = require('chai').assert;

// Temp dir
var tempDir = './tests/tmp';
fs.access(tempDir, fs.F_OK, function (err) {
    if (err) {
        fs.mkdirSync(tempDir);
    }
});
