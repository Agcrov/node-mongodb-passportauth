var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var logger = require('morgan');
const config = require('./config/config');
var sassMiddleware = require('node-sass-middleware');
var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');
var passport = require('passport');

//mongoose set up
var mongoose = require('mongoose');
mongoose.connect(config.database);
// CONNECTION HANDLERS
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database);
});
// Retry connection
const connectWithRetry = () => {
    console.log('MongoDB connection with retry');
    return mongoose.connect(config.database);
};
// Exit application on error
mongoose.connection.on('error', err => {
    console.log(`MongoDB connection error: ${err}`);
    setTimeout(connectWithRetry, 5000);
    // process.exit(-1)
});

var app = express();

const port = config.port;

app.use(cors());
app.use(bodyParser.json());
//Passport set up
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false , // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log('its alive alive');
});

module.exports = app;
