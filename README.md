# jsonParser
NodeJS: Parse big JSON files using streams.


Ready to parse big files with the following format:

´´´javascript

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

´´´javascript