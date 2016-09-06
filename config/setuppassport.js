const passport = require("passport");

var LocalStrategy = require("passport-local").Strategy;

var User = require("../models/user");

passport.use("login", new LocalStrategy(function(username, password, done){
    User.findOne({ username: username}, function(err, user){
        if (err) { return done(err); }
        if(!user) { return done(null, false, { message: "No user has that username!" }); }

        user.checkPassword(password, function(err, isMatch){
            if(err) { return done(err); }
            if(isMatch) { 
                return done(null, user); 
            }else{
                return done(null, false, { message: "Invalid password."});
            }
        });
    });
}));

module.exports = function() {
    //Serialize User
    passport.serializeUser(function(user, done){
        done(null, user._id);
    })

    //Deserialize User
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        })
    })
};