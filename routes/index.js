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

//Get user/error info from session
router.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
})

//Handle connection to server at base directory
router.get("/", function(req, res, next){
    User.find()
        .sort({ createdAt: "descending"})
        .exec()
        .then(function(users) {
            res.render("index", { users: users });
        })
        .catch(function(err){
            return next(err);
        });
});


/***********************************
 * EXPORTS
 ************************************/
//Export router
module.exports = router;