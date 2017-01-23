/***********************************
 * NPM DEPENDENCIES
 ************************************/
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
const ws = require("express-ws");
const serveIndex = require("serve-index");

/***********************************
 * LOCAL DEPENDENCIES
 ************************************/
//grab lam config
const conf = require("./config/config.json");

//Define routes
var routes = require("./routes/index");
var login = require("./routes/login");
var profile = require("./routes/profile");

//Import websocket controllers
const chatController = require('./controllers/chatroom.js');

//Import passport setUpPassport
var setUpPassport = require("./config/setuppassport");

//Set up path variables
var faviconPath = path.join(__dirname, "public", "favicon.ico");
var logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
try{
    fs.accessSync(logDirectory)
}catch(err){
    fs.mkdirSync(logDirectory)
}

/***********************************
 * CONFIGURE SERVER
 ************************************/
//Create express app and add websocket
var app = express();
ws(app);

//Initialize MongoDB Connection
var mongoURI = conf.mongoURI;
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI);


// create a rotating write stream for logs
var accessLogStream = fsr.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
});

//Set up passport authentication protocol
setUpPassport();

//Set server port
app.set("port", process.env.PORT || 3000);

//Set views path and views engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Disable made with Express header
app.disable("x-powered-by");

//serve static files from public folder and vendor folder
app.use('/static', express.static('public'));
app.use('/static', serveIndex('public'));
app.use('/vendor', express.static('vendor'));
app.use('/vendor', serveIndex('vendor'));

/***********************************
 * MIDDLEWARE
 ************************************/
//Logging middle
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
    saveUninitialized: true,
    cookie: {expires: new Date(Date.now() + (240 * 60 * 1000))}
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
//Flash messages - for erros/info
app.use(flash());
//Passport authentication protocol
app.use(passport.initialize());
app.use(passport.session());

/***********************************
 * ROUTING
 ************************************/
//Use defined routes
app.use(routes);
app.use(login);
app.use(profile);

chatController(app, sessionHandler);

/***********************************
 * DEFAULT/ERROR
 ************************************/
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

/***********************************
 * EXPORTS
 ************************************/
module.exports = app;





