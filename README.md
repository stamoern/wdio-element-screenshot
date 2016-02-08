wdio-element-screenshot
===========

Additional package for [WebdriverIO](https://github.com/webdriverio/webdriverio). Provides custom commands for taking and saving screenshots of particular elements on the page.

## Usage:

````javascript
var client = require('webdriverio').remote({...})
var wdioElementScreenshot = require('wdio-element-screenshot');
...
wdioElementScreenshot.init(client);
...
client
    .saveElementScreenshot('#block', 'block.png')
    .then(...);
````

## API:
This package adds 3 custom commands to WebdriverIO client:

### saveElementScreenshot(selector, filename)
Saves element screenshot to png file. Returns `Promise` that resolves with elements screenshot image data

#### selector
Type: `String`
Selector that specifies a particular element e.g. `body`. Notice that if selector specifies several elements, the first one will be taken
 
#### filename
Type: `String`
The saving file name

### takeElementScreenshot(selector)
Takes element screenshot. Returns `Promise` that resolves with elements screenshot image data

#### selector
Type: `String`
Selector that specifies a particular element e.g. `body`. Notice that if selector specifies several elements, the first one will be taken

### getElementRect(selector)
Gets element absolute bounding rect. Returns `Promise` that resolves with elements absolute bounding rect

#### selector
Type: `String`
Selector that specifies a particular element e.g. `body`. Notice that if selector specifies several elements, the first one will be taken


## Tests:

````
npm install

./node_modules/.bin/selenium-standalone start

npm run test
````
