/***********************************
 * NPM DEPENDENCIES
 ************************************/
const express = require("express");
const passport = require("passport");
const csrf = require("csurf");

/***********************************
 * ROUTER CONFIGURATION
 ************************************/
//Import user schema
var User = require("../models/user");

//Create router object
var router = express.Router();

//User CSRF to prevent cross site form submission
router.use(csrf());

//Render signup page on signup GET request
router.get("/signup", function(req, res){
    res.render("signup", { csrfToken: req.csrfToken() });
});

//Create user if not exists on signup POST request
// Redirect to main page if authenticated, else return to signup with flash message
router.post("/signup", function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ username: username }).exec()
        .then(function(user){
            if (user) {
                req.flash("error", "User already exists");
                return res.redirect("/signup");
            }

            var newUser = new User({
                username: username,
                password: password
            });
            newUser.save(next);
        })
        .catch(function(err){
            return next(err);
        });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));

//Render login page on login GET request
router.get("/login", function(req, res){
    res.render("login", { csrfToken: req.csrfToken() });
});

//Authenticate and log in user on login POST request
router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

//Logout current user
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

/***********************************
 * EXPORTS
 ************************************/
//Export router
module.exports = router;