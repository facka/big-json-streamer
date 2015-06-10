# big-json-streamer
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
