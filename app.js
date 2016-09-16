const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const logger = require("morgan");
const passport = require("passport");
const helmet = require("helmet");
const fsr = require("file-stream-rotator");
const fs = require("fs");
const favicon = require("serve-favicon");


//grab lam config
const conf = require("./config/config.json");

//Define routes
var routes = require("./routes/index");
var login = require("./routes/login");
var profile = require("./routes/profile");

//Import passport setUpPassport
var setUpPassport = require("./config/setuppassport");

var faviconPath = path.join(__dirname, "public", "favicon.ico");
var logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


//Create express app and add websocket
var app = express();
var ws = require("express-ws")(app);
var appWss = ws.getWss();

//Initialize MongoDB Connection
var mongoURI = conf.mongoURI;
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI);


// create a rotating write stream
var accessLogStream = fsr.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
});

setUpPassport();

//Set server port
app.set("port", process.env.PORT || 3000);

//Set views path and views engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Disable made with Express header
app.disable("x-powered-by");

//Middleware
app.use(logger('dev', { stream: accessLogStream }));

//Serve favicon.ico
app.use(favicon(faviconPath));
//Allow parsing of request body
app.use(bodyParser.urlencoded({ extended: false}));
//Allow parsing of cookies
app.use(cookieParser());
//Session cookie manager
var sessionHandler = session({
    secret: conf.secret,
    rolling: true,
    resave: true,
    saveUninitialized: true
})
app.use(sessionHandler);
//Security - prevent cross site scripting
app.use(helmet.xssFilter());
//Security - prevent iframe of site
app.use(helmet.frameguard({ action: "deny" }));
//Securiyt - Don't allow scripts to run from plain text'
app.use(helmet.noSniff());
//Security - fix issue with IE downloading content
app.use(helmet.ieNoOpen());
//Security - CSP
app.use(helmet.contentSecurityPolicy());

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//Use defined routes
app.use(routes);
app.use(login);
app.use(profile);


app.ws("/", function(ws, req) {
    var request = ws.upgradeReq;
    var response = {writeHead: {}}; //What?
    sessionHandler(request, response, function(err){
        if(!request.session.passport.user){
            ws.send("Invalid session");
            ws.close();
            return;
        }
        console.log("Client connected");
        
        ws.on('message', function(msg){
            appWss.clients.forEach(function(client){
                client.send("Resent from server: " + msg);
            });
        });

        ws.on('close', function(){
            appWss.clients.forEach(function(client){
                client.send("User disconnected: " + request.user.name());
            });
            console.log("Client disconnected");
        });

        appWss.clients.forEach(function(client){
            client.send("User connected: " + request.user.name());
        });
    });
});

//404 NOT FOUND
app.use(function(req, res){
    res.status(404);
    res.end("Error:  Page not found");
});

//HANDLE ERRORS
app.use(function(err, req, res, next){
    if(err.code !== "EBADCSRFTOKEN"){
        next(err);
        return;
    }
    res.status(403);
    res.send("CSRF Error.");
});

app.use(function(err, req, res){
    res.status(500);
    res.end("errors occured");
});

module.exports = app;





