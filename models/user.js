const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/database');

//User Schema
const UserSchema = mongoose.Schema({
    name: { type: String},
    email: { type: String, unique : true, required : true, dropDups: true},
    username: { type: String, required: true},
    password: { type: String, required: true}
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback){
  User.findById(id, callback);
};

module.exports.getUserByUsername = function (username, callback){
    const query = {username: username};
    User.findOne(query, callback);
};
module.exports.getUserByEmail = function (email, callback){
    const query = {email: email};
    User.findOne(query, callback);
};
module.exports.addUser = function (user, callback){
    //Encrypting the user password
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user.save(callback);
        });
    });
};
module.exports.comparePassword = function(candidatePassword, hashedPassword, callback){
    bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    })
};