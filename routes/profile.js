/***********************************
 * NPM DEPENDENCIES
 ************************************/
const express = require("express");
const passport = require("passport");
//const csrf = require("csurf");

/***********************************
 * ROUTER CONFIGURATION
 ************************************/
//Import user schema
var User = require("../models/user");

//Create router object
var router = express.Router();

//User CSRF to prevent cross site form submission
//router.use(csrf());

//Makes sure user is logged in before handling request to protected page
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/login");
    }
}

//Render user profile
router.get("/users/:username", function(req, res, next){
    User.findOne({ username: req.params.username }).exec()
        .then(function(user){
            if (!user) { return next(404); }

            res.render("profile", { user: user });
        })
        .catch(function(err){
            return next(err);
        });
});


//Render profile edit page - must be logged in
router.get("/edit", ensureAuthenticated, function(req, res){
    res.render("edit", { /* csrfToken: req.csrfToken() */ });
});

//Apply profile edit - must be logged in
router.post("/edit", ensureAuthenticated, function(req, res, next){
    req.user.displayName = req.body.displayname;
    req.user.bio = req.body.bio;
    req.user.save()
        .then(function(){
            req.flash("info", "Profile updated!");
            res.redirect("/edit");
        })
        .catch(function(err){
            return next(err);
        });
});

//Render chat page - must be logged in
router.get("/chat", ensureAuthenticated, function(req, res, next){
    res.render("chat", { user: req.user });
});


/***********************************
 * EXPORTS
 ************************************/
//Export router
module.exports = router;