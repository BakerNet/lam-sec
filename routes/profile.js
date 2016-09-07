const express = require("express");
const passport = require("passport");
const csrf = require("csurf");

//Import user schema
var User = require("../models/user");

//Create router object
var router = express.Router();

//User CSRF to prevent cross site form submission
router.use(csrf());


function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/login");
    }
}


//Get user/error info from session
router.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
})

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



router.get("/edit", ensureAuthenticated, function(req, res){
    res.render("edit", { csrfToken: req.csrfToken() });
});

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


//Export router
module.exports = router;