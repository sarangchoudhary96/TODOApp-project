var flash = require('connect-flash');
const bcrypt = require('bcrypt');
const mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

exports.findByUsername = function(email, cb) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db){
        if(err) throw err;
        var dbo = db.db('todosapp');
        dbo.collection('users').findOne({Email: email}, function(err, result){
            if(err) throw err;
            if(result == null){
                return cb(null, null);
            }
            else{;
                return cb(null, result);
            }
        });
    });
}
exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch){
    if(err){
      console.log('err is' + err);
    }
    callback(null, isMatch);
  })
}