var fs = require('fs');

var fileName, callback, onEnd;

var bracketsOpen = [];
var previousChar = '';
var currentChar = '';

var LIMIT = 'limit';
var NULL = '';

var QUOTES = '"';
var OPENCURLYBRACES = '{';
var CLOSECURLYBRACES = '}';
var SEMICOLON = ':';
var BACKLSLASH = '\\';
var COMMA = ',';
var OPENBRACKET = '[';
var CLOSEBRACKET = ']';

var j = 0;
var readingKey, readingValue;
var stringValue = '';
var stopReadingKey;
var stopReadingValue;
var aux;
var auxValue;
var lastKey;
var collection;

var checkStopReadingKey = function() {
    return (currentChar === QUOTES) || ((j === content.length) ? LIMIT : NULL);
};

var checkStopReadingValue = function() {
    return ( currentChar === QUOTES && previousChar !== BACKLSLASH) || ((j === content.length) ? LIMIT : NULL);
};

function continueReadingKey() {
    stopReadingKey = checkStopReadingKey();

    while( !stopReadingKey) {
        previousChar = currentChar;
        stringValue += currentChar;
        j++;
        currentChar = content[j];
        stopReadingKey = checkStopReadingKey();
    }
    aux = stringValue;
    if (stopReadingKey !== LIMIT) {
        aux += QUOTES;
        stringValue = NULL;
        readingKey = false;
        lastKey = aux;
    }
    else {
        readingKey = true;
    }
    return aux;
}

function continueReadingValue() {
    stopReadingValue = checkStopReadingValue();
    while( !stopReadingValue) {
        previousChar = currentChar;
        stringValue += currentChar;
        j++;
        currentChar = content[j];
        stopReadingValue = checkStopReadingValue();
    }
    aux = stringValue;
    if (stopReadingValue !== LIMIT) {
        aux += QUOTES;
        stringValue = NULL;
        readingValue = false;
        lastValue = aux;
    }
    else {
        readingValue = true;
    }
    return aux;
}

function readString() {
    var isKey = false;
    stringValue = QUOTES;
    if (previousChar === OPENCURLYBRACES || previousChar === COMMA) {
        isKey = true;
    }
    else {
        if (previousChar === SEMICOLON || previousChar === OPENBRACKET) {
            isKey = false;
        }
        else {
            console.log("JSON: " + bracketsOpen[bracketsOpen.length-1].json);
            console.log("stringvalue: " + lastKey);
            throw new Error('Unable to identify if the string is key  or value: ' + previousChar);
        }
    }
    j++;
    currentChar = content[j];

    if (isKey) {
        auxValue = continueReadingKey();
    }
    else {
        auxValue = continueReadingValue();
    }

    return auxValue;
}

function parse(string) {
    content = string;
    for (j = 0; j < string.length; j++) {
        currentChar = content[j];

        if (readingKey) {
            value = continueReadingKey();
            if (!readingKey) {
                bracketsOpen[bracketsOpen.length-1].json += value;
            }
            continue;
        }

        if (readingValue) {
            value = continueReadingValue();
            if (!readingValue) {
                bracketsOpen[bracketsOpen.length-1].json += value;
            }
            continue;
        }

        if (currentChar === QUOTES) {
            value = readString();
            if (!(readingValue || readingKey)) {
                bracketsOpen[bracketsOpen.length-1].json += value;
            }
            continue;
        }

        if (currentChar === OPENCURLYBRACES) {
            bracketsOpen.push({
                json: ''
            });
        }

        if (currentChar === OPENBRACKET) {
            collection = lastKey;
        }

        if (currentChar === CLOSECURLYBRACES) {
            var bracketItem = bracketsOpen.pop();
            var jsonString = bracketItem.json;
            if (bracketsOpen.length) {
                bracketsOpen[bracketsOpen.length-1].json += '"[OBJECT]"';
                jsonString += CLOSECURLYBRACES;
                try {
                    var json = JSON.parse(jsonString);

                    callback(json, jsonString, collection);
                }
                catch (err) {
                    console.log("ERROR:" + jsonString.length);
                    console.log("MESSAGE:" + err);
                    //throw err;
                }
            }

            continue;
        }

        previousChar = currentChar;
        bracketsOpen[bracketsOpen.length-1].json += currentChar;
    }
}


module.exports = {
    setFile: function (_fileName) {
        fileName = _fileName;
    },
    parse: function () {
        var readableStream = fs.createReadStream(fileName);

        readableStream.on('data', function(chunk) {
            parse(chunk.toString());

        });

        readableStream.on('end', function() {
            onEnd();
        });
    },
    onJson: function(cb) {
        callback = cb;
    },
    onEnd: function(cb) {
        onEnd = cb;
    }
};
