var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon'); //(use if you want to include a favicon for the app)
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var busboy = require('connect-busboy');

//Sets up atabase
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/database", {native_parser:true})

var routes = require('./routes/index');
var records = require('./routes/records');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon()); //(use to include favicon)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//session should be updated to provide resave options etc, see deprecated error on startup
app.use(session({secret: 'very secret'}));
app.use(busboy());

//make our db accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/records', records);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//make accessible
module.exports = app;
