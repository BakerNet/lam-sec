var srv = require("../../app.js");

srv.app.listen(srv.app.get("port"), function(){
    console.log("Server started on port " + srv.app.get("port"));
});

srv.httpsServer.listen(443);
