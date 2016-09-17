/***********************************
 * NPM DEPENDENCIES
 ************************************/
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

/***********************************
 * LOCAL DEPENDENCIES
 ************************************/
var User = require("../models/user");

/***********************************
 * LOGIN AUTHENTICATION STRATEGY
 ************************************/
passport.use("login", new LocalStrategy(function(username, password, done){
    //Find user in database
    User.findOne({ username: username}, function(err, user){
        if (err) { return done(err); }
        if(!user) { return done(null, false, { message: "No user has that username!" }); }
        //User found - check password
        user.checkPassword(password, function(err, isMatch){
            if(err) { return done(err); }
            if(isMatch) { 
                //Log in
                return done(null, user); 
            }else{
                return done(null, false, { message: "Invalid password."});
            }
        });
    });
}));

/***********************************
 * EXPORTS
 ************************************/
module.exports = function() {
    //Serialize User
    passport.serializeUser((user, done)=>{
        done(null, user._id);
    });

    //Deserialize User
    passport.deserializeUser((id, done)=>{
        User.findById(id, function(err, user){
            done(err, user);
        });
    });
};