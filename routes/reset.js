const route = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongo = require('mongodb');
var todos = require('../routes/todos');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

route.get('/reset-your-password/:id', (req, res) => {
    const user1 = todos.resetpassword();
    const date_now = Date.now();
    if(date_now > user1.resetpasswordexpires){
        req.flash('error','This link has been expired now');
        res.redirect('/login');
    }else{
        res.render('reset');
    }
});

route.post('/reset-your-password', (req, res) => {
    var user = todos.resetpassword();
    var password1 = req.body.password1;
    var password2 = req.body.password2;
    if(password1 != password2){
        crypto.randomBytes(20, (err, buff) => {
            if(err) throw err;
            var token = buff.toString('hex');
            req.flash('error', 'passwords do not match')
            console.log('not matched');
            res.redirect('/reset-your-password/' + token);
        });
    }
    else{
        bcrypt.hash(password1, 10, (err, hash) => {
            if(err) throw err;
            MongoClient.connect(url, {useNewUrlParser: true}, (err, db) => {
                if(err) throw err;
                var dbo = db.db('todosapp');
                var query = {Email: user.Email};
                var newvalues = {$set: {password: hash}};
                dbo.collection('users').updateOne(query, newvalues, (err, res) => {
                    if(err) throw err;
                    db.close();
                });
            });
        });
        req.flash('success_msg', 'Your password has been updated successfully');
        res.redirect('/login');
      }

});

module.exports = route