import pngCrop from 'png-crop';
import fs from 'fs';

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
    return new Promise(resolve => {
        this.takeElementScreenshot(elementSelector)
            .then(imageBuffer => {
                if (!imageBuffer) {
                    return resolve(null);
                }
                fs.writeFile(filename, imageBuffer, err => resolve(err ? null : imageBuffer));
            });
    });
}

/**
 * @param {String} elementSelector
 */
function takeElementScreenshot(elementSelector) {
    if (typeof elementSelector !== 'string') {
        return Promise.resolve(null);
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
 * @returns {Promise}
 */
function getElementRect(elementSelector) {
    return this
        .execute(getElementBoundingRect, elementSelector)
        .then(resp => resp.value ? resp.value : null);
}

/**
 * @param {Object} rect
 * @param {String} screenshot
 * @returns {Promise}
 */
function cropScreenshot([rect, screenshot]) {
    if (!rect || !screenshot) {
        return Promise.resolve(null);
    }
    var cropConfig = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
    return new Promise(resolve => {
        pngCrop.cropToStream(screenshot, cropConfig, (err, outputStream) => {
            if (err) {
                return resolve(null);
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
 * Gets the position and size of an element.
 *
 * This function is run in the browser so its scope must be contained.
 *
 * @param {String} elementSelector
 * @returns {Object|undefined}
 */
function getElementBoundingRect(elementSelector) {
    /**
     * @param {Window} win
     * @param {Object} [dims]
     * @returns {Object}
     */
    function computeFrameOffset(win, dims) {
        // initialize our result variable
        dims = dims || {
            left: win.pageXOffset,
            top: win.pageYOffset
        };

        // add the offset & recurse up the frame chain
        var frame = win.frameElement;
        if (frame) {
            var rect = frame.getBoundingClientRect();
            dims.left += rect.left + frame.contentWindow.pageXOffset;
            dims.top += rect.top + frame.contentWindow.pageYOffset;

            if (win !== window.top) {
                computeFrameOffset(win.parent, dims);
            }
        }

        return dims;
    }

    /**
     * @param {HTMLElement} element
     * @param {Object} frameOffset
     * @returns {Object}
     */
    function computeElementRect(element, frameOffset) {
        var rect = element.getBoundingClientRect();

        return {
            left: rect.left + frameOffset.left,
            right: rect.right + frameOffset.left,
            top: rect.top + frameOffset.top,
            bottom: rect.bottom + frameOffset.top,
            width: rect.width,
            height: rect.height
        };
    }

    var element = document.querySelectorAll(elementSelector)[0];
    if (element) {
        var frameOffset = computeFrameOffset(window);
        var elementRect = computeElementRect(element, frameOffset);

        return elementRect;
    }
}
