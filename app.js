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

//grab lam config
const conf = require("./config/config.json");

//Set routes location
var routes = require("./routes");

//Create express app
var app = express();

//Import passport setUpPassport
var setUpPassport = require("./setuppassport");

//Initialize MongoDB Connection
var mongoURI = conf.mongoURI;
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI);

setUpPassport();

//Set server port
app.set("port", process.env.PORT || 3000);

//Set views path and views engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Disable made with Express header
app.disable("x-powered-by");

//Middleware
app.use(logger('dev'));

//Allow parsing of request body
app.use(bodyParser.urlencoded({ extended: false}));
//Allow parsing of cookies
app.use(cookieParser());
//Session cookie manager
app.use(session({
    secret: conf.secret,
    resave: true,
    saveUninitialized: true
}));
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

app.use(routes);

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

app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});






