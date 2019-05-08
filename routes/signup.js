const route = require('express').Router();
const bcrypt = require('bcrypt');
const mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

route.get('/signup', function(req, res){
    res.render('signup');
})

route.post('/signup', function(req, res){
    var p1 = req.body.password;
    var p2 = req.body.password1;
    if(p1 != p2){
        req.flash('error_msg', 'Passwords do not match');
        res.redirect('/signup');
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        dbo.collection('users').findOne({username: req.body.username}, function(err, result){
            if(err) throw err;
            if(result != null){
                req.flash('error_msg', 'Username already exists');
                res.redirect('/signup');
            }
            else if(result == null){
                dbo.collection('users').findOne({Email: req.body.email}, function(err, results){
                    if(err) throw err;
                    if(results != null){
                        req.flash('error_msg', 'Email already exists');
                        res.redirect('/signup');
                    }
                });
            }  
                bcrypt.hash(req.body.password, 10, function(err, hash){
                    if(err) throw err;
                    var mydata = {username : req.body.username, Email: req.body.email, password: hash};
                    dbo.collection('users').insertOne(mydata, function(err, results){
                        if(err) throw err;
                        req.flash('success_msg', 'You have succesfully signed up');
                        db.close();
                        res.redirect('/login');
                    });
                 });
        })
    });
    
})

module.exports = route