const route = require('express').Router();
const log = require('../routes/login');
const mongo = require('mongodb');
const objectID = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// get request for todos page
route.get('/todos', ensureAuthenticated, function(req, res){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        var dbo = db.db('todosapp');
        dbo.collection('todos').find({}).toArray(function(err, results){
            var n = results.length;
            var user1 = log.logger();
            var count  = 0;
            for(var i=0;i<n;i++){
                if(results[i].todoperson == user1){
                    count++;
                };
            };
            if(count == 0){
                results.unshift({
                    todo_name: "You have not created any todo, Start creating todos now!!"
                });
            }

            for(var i=0;i<n;i++){
                if(results[i].Editable == 'Enable' && results[i].todoperson !=user1){
                    results[i].etable = 'disabled';
                };
            };
            for(var i=0;i<n;i++){
                if(results[i].todoperson != user1 && results[i].View == 'Disable'){
                    results[i].Editable = "";
                    results[i].View = "";
                }else{
                    results[i].Delete_task = 'Delete task';
                }
            };
            for(var i=0;i<n;i++){
                if(results[i].View == 'Enable' && results[i].todoperson != user1){
                    delete results[i];
                };
            }; 
            res.render('todos', {row: results});
        });
    });
});

// this function is to check that the user is logined or not
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/login');
    }
}

// This is a post request for submitting a todo
route.post('/todos', function(req, res){
    var todoname = req.body.todo_name;
    var todobody = req.body.todo_body;
    var user1 = log.logger();
    var Edit = 'Enable';
    var vi = 'Disable';
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        var objdata = {todoperson: user1,todo_name: todoname, todo_body: todobody, Editable: Edit, View: vi};
        dbo.collection('todos').insertOne(objdata, function(err, result){
            if(err) throw err;
            db.close();
            res.redirect('/todos');
        });
    });
});

// Delete request for deleting a todo
route.delete('/todo/delete/:id', (req, res, next) => {
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        const query = {_id: objectID(req.params.id)};
        dbo.collection('todos').deleteOne(query, function(err, obj){
            if(err) throw err;
            res.sendStatus(200);
        });
    });
});

// Get request for editing a todo
route.get('/todos/edit/:id', function(req, res, next){
    const query = {_id: objectID(req.params.id)};
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        var dbo = db.db('todosapp');
        dbo.collection('todos').find(query).next(function(err, todo){
            if(err) throw err;
            res.render('edit', {row: todo});
        });
    });
});

// post request for for submitting a todo after editing a todo
route.post('/todos/edit/:id', function(req, res){
    const query = {_id: objectID(req.params.id)};
    var todoname = req.body.todo_name;
    var todobody = req.body.todo_body;
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        var objdata = {todo_name: todoname, todo_body: todobody};
        dbo.collection('todos').updateOne(query, {$set: objdata} , function(err, result){
            if(err) throw err;
            db.close();
            res.redirect('/todos');
        });
    });
});

// This request is for AJAX request that this todo can be edited by other persons or not
route.post('/editable/:id', (req, res) => {
    const query = {_id: objectID(req.params.id)};
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        dbo.collection('todos').find(query).next(function(err, result){
            if(err) throw err;
            if(result != null){
                if(result.Editable == 'Enable'){
                    var res = 'Disable';
                    var newvalues = {$set : {Editable: res}};
                    dbo.collection('todos').updateOne(query, newvalues, function(err, results){
                        if(err) throw err;
                        db.close();
                    });
                }
                else if(result.Editable == 'Disable'){
                    var res = 'Enable';
                    var newvalues = {$set : {Editable: res}};
                    dbo.collection('todos').updateOne(query, newvalues, function(err, results){
                        if(err) throw err;
                        db.close();
                    });
                } 
            }
        });
        res.redirect('/todos');
    });
});

// This request is for AJAX request that this other persons can see this todo or not
route.post('/viewer/:id', (req, res) => {
    const query = {_id: objectID(req.params.id)};
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        dbo.collection('todos').find(query).next(function(err, result){
            if(err) throw err;
            if(result != null){
                if(result.View == 'Enable'){
                    var res = 'Disable';
                    var newvalues = {$set : {View: res}};
                    dbo.collection('todos').updateOne(query, newvalues, function(err, results){
                        if(err) throw err;
                        db.close();
                    });
                }
                else if(result.View == 'Disable'){
                    var res = 'Enable';
                    var newvalues = {$set : {View: res}};
                    dbo.collection('todos').updateOne(query, newvalues, function(err, results){
                        if(err) throw err;
                        db.close();
                    });
                } 
            }
        });
        res.redirect('/todos');
    });
});

// This request is for changing the password(forget password)
route.post('/forgetpassword', (req, res) => {
    var token = '';
    crypto.randomBytes(20, (err, buf) => {
        if(err) throw err;
        token += buf.toString('hex');
    });
    var useremail = req.body.Email;
    var query = {Email: useremail};
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        dbo.collection('users').find(query).next(function(err, result){
            if(err) throw err;
            if(result == null){
                req.flash('error', 'User does not exists');
                res.redirect('/login');
            }
            else{
                result.resetpasswordtoken = token;
                result.resetpasswordexpires = Date.now() + 3600000;
                module.exports.resetpassword = function(){
                    return result;
                };

                 // create reusable transporter object using the default SMTP transport
                 let transporter = nodemailer.createTransport({
                     host: 'smtp.gmail.com',
                     port: 587,
                     secure: false,
                     auth: {
                         user: 'sarangchoudhary1996@gmail.com', //Email address from where email will be sent
                         pass: '*' // Password of the above email address
                     },
                     tls: {
                         rejectUnauthorized: false
                     } 
                 });
    
                 // setup email data with unicode symbols
                 let mailOptions = {
                    from: '"TODOApp" <sarangchoudhary1996@gmail.com>', // sender address
                    to: useremail, //list of receivers
                    subject: 'no reply',
                    text: 'you are receiving this mail http://' + req.headers.host + '/reset/', // plain text body
                    html: 'you are receiving this mail because you have requested the reset of your password. please click on the following link or just copy this link to your browser to reset your password http://' + req.headers.host + '/reset-your-password/' + token + ' If you did not request this, please ignore this email and password will remain unchanged <br><br><br><strong>Note :</strong> This link is valid only for one hour.' // html body
                 };

                 // send mail with defined transport object
                 transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                 });
                 req.flash('success_msg', 'A reset password link has been sent to your email');
                 res.redirect('/login');
            }
        });
    });
});
module.exports = route