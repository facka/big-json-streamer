var fs = require('fs');
var ArrayBuffer = require('./arrayBuffer.js');

var input, output, callback, onEnd, buffer;

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
            throw new Error('Unable to identify if the string is key or value: ' + previousChar);
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
            if (collection) {
                buffer.end(true);
                //buffer.flush();
            }
            collection = lastKey;
            buffer = new ArrayBuffer(lastKey, output);
        }

        if (currentChar === CLOSECURLYBRACES) {
            var bracketItem = bracketsOpen.pop();
            var jsonString = bracketItem.json;
            if (bracketsOpen.length) {
                //bracketsOpen[bracketsOpen.length-1].json += '"[OBJECT]"';
                jsonString += CLOSECURLYBRACES;
                try {
                    var json = JSON.parse(jsonString);

                    var response = callback(json, jsonString, collection);

                    if (response) {
                        buffer.push(response);
                    }
                }
                catch (err) {
                    throw new Error('Invalid json.');
                }
            }

            continue;
        }

        if (currentChar === '\n' || currentChar === ' ') {
            continue;
        }
        previousChar = currentChar;
        bracketsOpen[bracketsOpen.length-1].json += currentChar;
    }
}

module.exports = {
    setInput: function (_input) {
        input = _input;
    },
    setOutput: function (_output) {
        output = _output;
    },
    parse: function () {

        if (!callback || !(callback && (typeof callback === 'function'))) {
            throw new Error('Please set onJson callback function to get each Json object');
        }

        if (!input) {
            throw new Error('Please set input as readable stream');
        }

        if (!output) {
            throw new Error('Please set output as writeable stream');
        }

        output.write('{');

        input.on('data', function(chunk) {
            parse(chunk.toString());
        });

        input.on('end', function() {
            buffer.end();
            output.write('}');
            if (onEnd) {
               onEnd();
            }
        });
    },
    onJson: function(cb) {
        callback = cb;
    },
    onEnd: function(cb) {
        onEnd = cb;
    }
};
