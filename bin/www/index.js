var app = require("../../app.js");
var https = require("https");
var fs = require('fs');
var config = require("../../config/config.json");

var options = {
    key: fs.readFileSync(sslPath + 'privkey.pem'),
    cert: fs.readFileSync(sslPath + 'fullchain.pem')
}

app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});

https.createSever(options, app).listen(443);
