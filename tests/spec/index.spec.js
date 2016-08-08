'use strict';

var wdioElementScreenshot = require('../../lib');
var fileUrl = require('file-url');
var pngDiff = require('png-diff');

var RED_DIV_RECT = {
    top: 10,
    left: 10,
    bottom: 210,
    width: 200,
    right: 210,
    height: 200
};

describe('wdioElementScreenshot', function () {

    before(function () {
        return browser
            .init()
            .url(fileUrl('./tests/page/index.html'))
            .pause(5000);
    });

    after(function () {
        return browser.end();
    });

    beforeEach(function () {
        // Reset scroll position between tests
        return browser.scroll(0, 0);
    });

    describe('init', function () {
        it('should exists', function () {
            assert.isFunction(wdioElementScreenshot.init);
        });

        it('should add commands to web driver client', function () {
            wdioElementScreenshot.init(browser);
            assert.isFunction(browser.saveElementScreenshot);
            assert.isFunction(browser.takeElementScreenshot);
            assert.isFunction(browser.getElementRect);
        });
    });

    describe('getElementRect', function () {
        it('should get valid element rect', function () {
            return browser
                .getElementRect('#red')
                .then(function (rect) {
                    assert.deepEqual(rect, RED_DIV_RECT);
                });
        });

        it('should get valid element rect after scroll', function () {
            return browser
                .scroll(0, 100)
                .getElementRect('#red')
                .then(function (rect) {
                    assert.deepEqual(rect, RED_DIV_RECT);
                });
        });

        it('should return null if element is not found', function () {
            return browser
                .getElementRect('#not-found')
                .then(function (rect) {
                    assert.isNull(rect);
                });
        });
    });

    describe('saveElementScreenshot', function () {
        it('should save valid element screenshot', function () {
            var testFilename = './tests/tmp/red.png';
            var sampleFilename = './tests/samples/red.png';
            return browser
                .saveElementScreenshot('#red', testFilename)
                .then(compareScreenshotsFiles.bind(null, testFilename, sampleFilename));
        });

        it('should save valid element screenshot inside frame', function () {
            var testFilename = './tests/tmp/green.png';
            var sampleFilename = './tests/samples/green.png';

            return browser
                .frame(0)
                .saveElementScreenshot('#green', testFilename)
                .frameParent()
                .then(compareScreenshotsFiles.bind(null, testFilename, sampleFilename));
        });

        it('should save valid screenshot of element that is out of the viewport (scroll)', function () {
            var testFilename = './tests/tmp/blue.png';
            var sampleFilename = './tests/samples/blue.png';
            return browser
                .saveElementScreenshot('#blue', testFilename)
                .then(compareScreenshotsFiles.bind(null, testFilename, sampleFilename));
        });

        it('should return null if element is not found', function () {
            var testFilename = './tests/tmp/not-found.png';
            return browser
                .saveElementScreenshot('#not-found', testFilename)
                .then(function (data) {
                    assert.isNull(data);
                });
        });
    });
});

/**
 * @param {String} testFilename
 * @param {String} sampleFilename
 * @returns {Promise}
 */
function compareScreenshotsFiles(testFilename, sampleFilename) {
    return new Promise((resolve, reject) => {
        pngDiff.outputDiffStream(testFilename, sampleFilename, function (err, outStream, diffMetric) {
            if (err) {
                return reject(err);
            }
            assert.equal(diffMetric, 0, 'Saved screenshot doesn\'t match sample screentshot');
            return resolve();
        });
    });
}
