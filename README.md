# Learn About Me

Implementation of Learn About Me app from Express in Action - extended for learning purposes.

### Prerequisities

Node and npm required - use npm install to install dependencies


### Installing

Download source, install with npm, and start mongoDB.  

CURRENT VERSION ALSO REQUIRES LOCAL MEMCACHE STORE > see bottom of this page [Node.js GAE Memcache](https://cloud.google.com/appengine/docs/flexible/nodejs/using-redislabs-memcache)

### Make sure to set mongoDB URI and session secret in config/config.json

```
npm install

mongod --auth --dbpath "<Your DB path here>"

npm start
```

Then visit http://localhost:3000

## Built With

* Node.js
* Express
* Lots of Express middleware

## Authors

* **Hans Baker** - [BakerNet](https://github.com/BakerNet)

## Acknowledgments

* Hat tip to anyone who's libraries were used
* Evan Hahn for Express in Action!

## Known Issues

Currently not checking for same user entering chat - should probably control this.  Haven't tested effects.

CHAT is commented out on all files because this is deployed to GAE, which does not allow Websocket connections.

