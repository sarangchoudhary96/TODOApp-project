const route = require('express').Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/todoapp";
var url1 = "mongodb://localhost:27017";

route.get('/', function(req, res){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        db.close();
      });
      MongoClient.connect(url1,{useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        var dbo = db.db("todosapp");
        dbo.createCollection("users", function(err, res) {
          if (err) throw err;
        });
        dbo.createCollection("todos", function(err, res) {
            if (err) throw err;
        });
      });
    res.render('index');
});
module.exports = route