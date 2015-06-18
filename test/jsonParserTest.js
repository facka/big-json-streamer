var assert = require('assert');
var expect = require('expect');
var fs = require('fs');
var stream = require('stream');
var json = require('./test.json');

describe('jsonParser', function() {
 it('call parse without input', function() {
   var jsonParser = require('../jsonParser.js');
   jsonParser.onJson(function(json, string, collection) {
        return string;
   });
   expect(jsonParser.parse).toThrow('Please set input as readable stream');
 });

 it('call parse without output', function() {
   var jsonParser = require('../jsonParser.js');
   var input = fs.createReadStream('./test/test.json');

   jsonParser.onJson(function(json, string, collection) {
        return string;
   });

   jsonParser.setInput(input) ;

   expect(jsonParser.parse).toThrow('Please set output as writeable stream');
 });

 it('call parse without callback', function() {
   var jsonParser = require('../jsonParser.js');

   expect(jsonParser.parse).toThrow('Please set onJson callback function to get each Json object');
 });

 it('parse a json', function() {
   var jsonParser = require('../jsonParser.js');
   var input = fs.createReadStream('./test/test.json');

   var resultJson = '';

   var output = new stream.Writable();

   output._write = function(chunk, encoding, next) {
     resultJson+= chunk;
     next();
   };

   jsonParser.setInput(input) ;
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