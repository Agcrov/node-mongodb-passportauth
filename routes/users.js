var express = require('express');
var router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/config');

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

router.post('/register',(req, res, next) => {
    let user = new User ({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });
    console.log(user);
    User.addUser(user, (err, user) => {
        if (err){
            res.json({success: false, message:'Failed to register user', error: err});
        } else {
            res.json({success: true, message:'User registered', user: user});
        }
    });
});
router.post('/authenticate',(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email, (err, user) => {
       if (err) throw err;
       if(!user){
           return res.json({success: false, message: "User not found"});
       }else {
           User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800 // one week
                });
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username
                    }
                });
            } else {
                res.json({success: false, message: 'Wrong password'});
            }
           });
       }
    });
});

router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({user: req.user});
});
/* GET users listing. */
router.get('/', function(req, res, next) {
   res.json({success: false, message: 'Wrong password'});
});

module.exports = router;
