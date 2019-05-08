const route = require('express').Router();
var passport = require('passport'),Strategy = require('passport-local').Strategy;
var db = require('../db');

route.get('/login', function(req, res){
    res.render('login');
});

// This function is used to check the user already exits or not using passport strategy
//This function will call more function from db.js file
passport.use(new Strategy(function(username, password, cb){
    db.findByUsername(username, function(err, user) {
      if (err){ 
        return cb(err); 
      }
      if (!user){
         return cb(null, false);
      }
      module.exports.logger = function () {
        return user.username;
      };
      db.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){          
          return cb(null, user);
        }
        else{
          return cb(null, false);
        }
      });
    });
  }));
// Serialize a user
  passport.serializeUser(function(user, cb) {
    cb(null, user.username);
  });
  
// Deserialize a user
  passport.deserializeUser(function(user, cb) {
      cb(null, user);
  });

// This route is for post request for login form
route.post('/login',passport.authenticate('local', { failureRedirect: '/login',  failureFlash: 'Invalid username and Password'}), function(req, res){
    res.redirect('/');
});

//This route is for logout a user
route.get('/logout',function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = route