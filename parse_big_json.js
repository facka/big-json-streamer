'use strict';
/*global require*/
/*global process*/

var fs = require('fs');
var jsonParser = require('./jsonParser.js');
var ArrayBuffer = require('./arrayBuffer.js');

var file = process.argv[2];


var output = file ? fs.createWriteStream(file) : process.stdout;

//Buffer receives json and push them to a buffer. Call buffer.end() to write to the output the last items
// added and to close the array with ']'
var buffer = new ArrayBuffer('allJsons', output);;

output.write('{"all":');

//Set file from where read the json
jsonParser.setFile('./bigfile.json');

//Set callback to get each json found
jsonParser.onJson(function(json, string) {

//    Filter json accessing to the properties and push it to a buffer
//    if (json.type === 'entity') {
        
       buffer.push(string);
//    }

});

//Set callback to do something when the big json finish.
jsonParser.onEnd(function() {
    buffer.end();
    output.write('}');
});

//Start the parsing
jsonParser.parse();
