const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const SALT_FACTOR = 9;


/***************************************************************************
 * USER SCHEMA
 ***************************************************************************/

//Schema for user object in MongoDB
var userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    displayName: String,
    bio: String
});


/***************************************************************************
 * USER SCHEMA FUNCTIONS
 ***************************************************************************/

//Do nothing function
var noop = function(){};

//Before saving user, bcrypt password
userSchema.pre("save", function(done){
    var user = this;

    if (!user.isModified("password")) { return done(); }

    bcrypt.genSalt(SALT_FACTOR, function(err, salt){
        if(err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function(err, hashedPassword){
            if(err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });
});

/***************************************************************************
 * USER METHODS
 ***************************************************************************/

//Get user name
userSchema.methods.name = function(){
    return this.displayName || this.username;
};

//Check password attempt against user PW hash
userSchema.methods.checkPassword = function(guess, done){
    bcrypt.compare(guess, this.password, function(err, isMatch){
        done(err, isMatch);
    })
};


/***************************************************************************
 * EXPORTS
 ***************************************************************************/

var User = mongoose.model("User", userSchema);

module.exports = User;