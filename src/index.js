import pngCrop from 'png-crop';
import fs from 'fs';

/**
 * Entry point
 */

export default {
    /**
     * @param {Object} wdioInstance
     */
    init: function (wdioInstance) {
        wdioInstance.addCommand('getElementRect', getElementRect);
        wdioInstance.addCommand('takeElementScreenshot', takeElementScreenshot);
        wdioInstance.addCommand('saveElementScreenshot', saveElementScreenshot);
    }
};

/**
 * @param {String} elementSelector
 * @param {String} filename
 * @returns {Promise}
 */
function saveElementScreenshot(elementSelector, filename) {
    return new Promise((resolve, reject) => {
        this.takeElementScreenshot(elementSelector)
            .then((imageBuffer) => {
                fs.writeFile(filename, imageBuffer, (err) => err ? reject(err) : resolve(imageBuffer));
            }, reject);
    });
}

/**
 * @param {String} elementSelector
 */
function takeElementScreenshot(elementSelector) {
    if (typeof elementSelector !== 'string') {
        return Promise.reject({msg: 'Element selector is invalid or undefined'});
    }
    return Promise
        .all([
            this.getElementRect(elementSelector),
            this.saveScreenshot()
        ])
        .then(cropScreenshot);
}

/**
 * @param {String} elementSelector
 */
function getElementRect(elementSelector) {
    return this
        .execute(getElementBoundingRect, elementSelector)
        .then(resp => resp.value ? Promise.resolve(resp.value) : Promise.reject({msg: 'Element is not found'}));
}

/**
 * @param {Object} rect
 * @param {String} screenshot
 * @returns {Promise}
 */
function cropScreenshot([rect, screenshot]) {
    if (!rect || !screenshot) {
        return Promise.reject('Unable to get element screenshot:'
            + (!rect ? ' element is not found;' : '')
            + (!screenshot ? ' empty screenshot;' : '')
        );
    }
    var cropConfig = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
    return new Promise((resolve, reject) => {
        pngCrop.cropToStream(screenshot, cropConfig, (err, outputStream) => {
            if (err) {
                reject(err);
                return;
            }
            var buffers = [];
            outputStream
                .on('data', (chunk) => {
                    buffers.push(chunk);
                })
                .on('end', () => resolve(Buffer.concat(buffers)));

        });
    });
}

/**
 * @param {String} elementSelector
 * @returns {Object|undefined}
 */
function getElementBoundingRect(elementSelector) {
    var element = document.querySelectorAll(elementSelector)[0];
    if (element) {
        var rect = element.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            right: rect.right + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            bottom: rect.bottom + window.pageYOffset,
            width: rect.width,
            height: rect.height
        };
    }
}
