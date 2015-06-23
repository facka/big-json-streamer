var assert = require('assert');
var expect = require('expect');
var fs = require('fs');
var stream = require('stream');
var json = require('./test.json');

//calls a function that throws an uncaught exception
function _try(func, callback, done) {

  var originalException = process.listeners('uncaughtException').pop();

  if (originalException) {
    //Needed in node 0.10.5+
    process.removeListener('uncaughtException', originalException);
  }

  process.once("uncaughtException", callback);

  func();

  process.nextTick(function () {
    process.listeners('uncaughtException').push(originalException);
    done();
  });
}


describe('call parse without input', function() {
 it('throws exception', function() {
   var jsonParser = require('../jsonParser.js');
   jsonParser.onJson(function(json, string, collection) {
        return string;
   });
   expect(jsonParser.parse).toThrow('Please set input as readable stream');
 });
});

describe('call parse without output', function() {
 it('throws exception', function() {
   var jsonParser = require('../jsonParser.js');
   var input = fs.createReadStream('./test/test.json');

   jsonParser.onJson(function(json, string, collection) {
        return string;
   });

   jsonParser.setInput(input) ;

   expect(jsonParser.parse).toThrow('Please set output as writeable stream');
 });
});

describe('call parse without callback', function() {
 it('throws exception', function() {
   var jsonParser = require('../jsonParser.js');
   jsonParser.onJson("wrong parameter");
   expect(jsonParser.parse).toThrow('Please set onJson callback function to get each Json object');
 });
 it('throws exception', function() {
   var jsonParser = require('../jsonParser.js');
   expect(jsonParser.parse).toThrow('Please set onJson callback function to get each Json object');
 });
});

describe('parse a json where it can\'t identify a key', function() {
 it('throws exception', function(done) {
   var jsonParser = require('../jsonParser.js');
   var input = fs.createReadStream('./test/invalidkey.json');

   jsonParser.onJson(function(json, string, collection) {
        return string;
   });

   var output = new stream.Writable();
   output._write = function(chunk, encoding, next) {
     next();
   };

   jsonParser.setInput(input);
   jsonParser.setOutput(output);

   _try(jsonParser.parse, function _catch(error) {
     assert.equal(error.message, 'Unable to identify if the string is key or value: d');
   }, done);

 });
});

describe('parse an invalid json', function() {
 it('throws exception', function(done) {
   var jsonParser = require('../jsonParser.js');
   var input = fs.createReadStream('./test/invalidjson.json');

   jsonParser.onJson(function(json, string, collection) {
        return string;
   });

   var output = new stream.Writable();
   output._write = function(chunk, encoding, next) {
     next();
   };

   jsonParser.setInput(input);
   jsonParser.setOutput(output);

   _try(jsonParser.parse, function _catch(error) {
     assert.equal(error.message, 'Invalid json.');
   }, done);

 });
});

describe('parse a json', function() {
 it('writes to the output the same json', function() {
   var jsonParser = require('../jsonParser.js');
   var input = fs.createReadStream('./test/test.json');

   var resultJson = '';

   var output = new stream.Writable();

   output._write = function(chunk, encoding, next) {
     resultJson+= chunk;
     next();
   };

   jsonParser.setInput(input);
   jsonParser.setOutput(output);
   jsonParser.onJson(function(json, string, collection) {
        return string;
   });
   jsonParser.onEnd(function() {
     assert.equal(resultJson, json);
   });

   jsonParser.parse();
 });
});