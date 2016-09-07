const express = require("express");
const passport = require("passport");
const csrf = require("csurf");

//Import user schema
var User = require("../models/user");

//Create router object
var router = express.Router();

//User CSRF to prevent cross site form submission
router.use(csrf());

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

router.get("/signup", function(req, res){
    res.render("signup", { csrfToken: req.csrfToken() });
});

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


router.get("/login", function(req, res){
    res.render("login", { csrfToken: req.csrfToken() });
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

//Export router
module.exports = router;