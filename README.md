# big-json-streamer
[![NPM](https://nodei.co/npm/big-json-streamer.png)](https://npmjs.org/package/big-json-streamer)

[![Coverage Status](https://coveralls.io/repos/facka/big-json-streamer/badge.svg)](https://coveralls.io/r/facka/big-json-streamer)

NodeJS: Parse big JSON files using streams.

Parse big files with the following format streaming to the output the choosen jsons:


    {
      "collection1" : [
          {"key1": "value",
           "key2": "value"
          },
          {"key1": "value",
           "key2": "value"
          },
          ...
      ],
      "collection2" : [
          {"key1": "value",
           "key2": "value"
          },
          {"key1": "value",
           "key2": "value"
          },
          ...
      ],
    }
    
## Streams JSON one by one saying from which collection is the json node

```javascript
/**
* Return the string that will be pushed to the writable stream. If you want to ignore the json node just return null.
*/
jsonParser.onJson(function(json, string, collection) {
        return string;
});
```
    

##Example

```javascript
var fs = require('fs');
var jsonParser = require('big-json-streamer');

var file = process.argv[2];
var output = file ? fs.createWriteStream(file) : process.stdout;
var input = fs.createReadStream('./test.json');

//Set readableStream from where read the json
jsonParser.setInput(input);
//Set writableStream from where write the json
jsonParser.setOutput(output);
//Set callback to get each json found
jsonParser.onJson(function(json, string, collection) {

//    Filter json accessing to the properties and return the string value if you want to include it to the result or null if you want to discard it.

//    if (json.type === 'entity') {
        return string;
//    }

});

//Set callback to do something when the big json finish.
jsonParser.onEnd(function() {
    console.log('End!');
});

//Start the parsing
jsonParser.parse();

```
