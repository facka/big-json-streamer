'use strict';
/*global require*/
/*global process*/
/*global console*/

var fs = require('fs');
var jsonParser = require('../jsonParser.js');

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
