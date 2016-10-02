# Project Title

Implementation of Learn About Me app from Express in Action - extended for learning purposes.

### Prerequisities

Node and npm required - use npm install to install dependencies


### Installing

Download source, install with npm, and start mongoDB.  

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

* Hat tip to anyone who's code was used
* Evan Hahn for Express in Action!

## Known Issues

IE and Edge do not support getElementById on objects returned by document.getElementbyId.  Therefore, chat.js does not work in IE or Edge.  It does, however, work in both Chrome and Firefox.
The way chat room objects are added is using templates, and updating the members of the template with correct content.  This method does not work in Edge.

Errors:
SCRIPT438: Object doesn't support property or method 'getElementById'