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

/***********************************
 * LOCAL DEPENDENCIES
 ************************************/
//grab lam config
const conf = require("./config/config.json");

//Define routes
var routes = require("./routes/index");
var login = require("./routes/login");
var profile = require("./routes/profile");

//Import passport setUpPassport
var setUpPassport = require("./config/setuppassport");

//Set up path variables
var faviconPath = path.join(__dirname, "public", "favicon.ico");
var logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

/***********************************
 * CONFIGURE SERVER
 ************************************/
//Create express app and add websocket
var app = express();
var ws = require("express-ws")(app);
var appWss = ws.getWss();

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
app.use('/vendor', express.static('vendor'));

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

/***********************************
 * WEBSOCKET SERVER - Chatroom
 *   Chatroom websocket server
 ************************************/
app.ws("/", function(ws, req) {
    var request = ws.upgradeReq;
    var response = {writeHead: {}}; //What?
    //Make sure user is logged in.  Close websocket if not
    sessionHandler(request, response, function(err){
        if(!request.session.passport.user){
            ws.send("Invalid session");
            ws.close();
            return;
        }
        console.log("Client connected");
        
        //When message received, broadcast that message to all clients
        ws.on('message', (msg)=>{
            let resmsg = JSON.stringify({
                type: "message",
                message: msg,
                client: request.user.name()
            });
            appWss.clients.forEach(function(client){
                client.send(resmsg);
            });
        });
        //When user disconnects, let all clients know
        ws.on('close', ()=>{
            let resmsg = JSON.stringify({
                type: "disconnect",
                message: `User disconnected: ${request.user.name()}`,
                client: request.user.name()
            });
            appWss.clients.forEach((client)=>{
                client.send(resmsg);
            });
            console.log("Client disconnected");
        });

        let joinmsg = JSON.stringify({
            type: "connect",
            message: `User connected: ${request.user.name()}`,
            client: request.user.name()
        });
        //When new user connects, let all clients know
        //Also - get list of all current clients
        let clients = [];
        appWss.clients.forEach((client)=>{
            client.send(joinmsg);
            clients.push(client.upgradeReq.user.name());
        });

        let clientsmsg = JSON.stringify({
            type: "users",
            clients: clients
        })
        //Send list of all current clients to recently connected user
        ws.send(clientsmsg)
    });
});

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





