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
    if (req.body.name && req.body.email && req.body.username && req.body.password){
        let user = new User ({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        User.addUser(user, (err, user) => {
            if (err){
                res.json({success: false, message:'Failed to register user', error: err});
            } else {
                res.json({success: true, message:'User registered', user: user});
            }
        });
    } else {
        res.sendStatus(400)
    }

});
router.post('/authenticate',(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password){
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
    } else {
        res.sendStatus(400);
    }
});


// This endpoint its just an example of a protected route -- It could return extra user's information
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    const email = req.body.email;
    if (email){
        User.getUserByEmail(email, (err, user) => {
            if (err) throw err;
            if(!user){
                return res.json({success: false, message: "User not found"});
            }else {
                res.json({
                    success: true,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username
                    }
                });
            }
        });
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;
