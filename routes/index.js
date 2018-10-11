var express = require('express');
var router = express.Router();

const users = require('./users');

router.use('/users', users);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index' });
});

module.exports = router;
