var app = require("../../app.js");
var https = require("https");
var fs = require('fs');
var config = require("../../config/config.json");

var options = {
    key: fs.readFileSync(config.sslPath + 'privkey.pem'),
    cert: fs.readFileSync(config.sslPath + 'fullchain.pem')
}


app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});

https.createServer(options, app).listen(443);
