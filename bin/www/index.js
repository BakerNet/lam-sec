var app = require("../../app.js");

app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});

