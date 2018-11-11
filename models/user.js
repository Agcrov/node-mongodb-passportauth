const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//User Schema
const UserSchema = mongoose.Schema({
    name: { type: String},
    email: { type: String, unique : true, required : true, dropDups: true},
    username: { type: String, required: true},
    password: { type: String, required: true}
},{timestamps:true});

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
//TODO: change addUser to return an error with invalid email and catch it on unit testing
//TODO: NOT ACCEPT RESPONSE STATUS 400
module.exports.addUser = function (user, callback){
    if(user.password && user.name && user.username && user.email){
        //Encrypting the user password
        bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                if (User.validateEmail(user.email)){
                    user.save(callback);
                } else {
                    callback( new Error('Trying to save user. Invalid Email.'));
                }
            });
        });
    } else {
        let err = new Error('Trying to save user. Missing parameters.');
        throw err;
    }

};
module.exports.comparePassword = function(candidatePassword, hashedPassword, callback){
    bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    })
};
module.exports.validateEmail = (email) => {return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))};