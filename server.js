const express = require('express');
const bp = require('body-parser');
const exphbs = require('express-handlebars');
var passport = require('passport');
const path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

const app = express();

const SERVER_PORT = process.env.PORT || 3000;

//body parser
app.use(bp.json());
app.use(bp.urlencoded({extended: false}));

//View engine
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({default:'index'}));
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname,'public')));

// BodyParser Middleware
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
app.use(session({
    key: 'user_sid',
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    cookie: {
        expires: 6000000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

// Global Variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.book_error = req.flash('book_error');
    res.locals.error_message = req.flash('error_message');
    res.locals.user = req.user || null;
    next();
}); 

app.use('/', require('./routes/index'));
app.use('/', require('./routes/login'));
app.use('/', require('./routes/signup'));
app.use('/', require('./routes/todos'));
app.use('/', require('./routes/reset'));

// calling a server
app.listen(SERVER_PORT,function(){
    console.log('http://localhost:3000');
})