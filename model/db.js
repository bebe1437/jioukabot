var firebase = require("firebase");
var config = require('config');
var app = firebase.initializeApp(config.get('firebase'));

module.exports = db;
function db(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
}

db.get = function(){
    return new db(app);
}

db.prototype.update = function(updates){
    var db = this;
    console.log('db.update:%s', JSON.stringify(updates));
    db.database().ref().update(updates);
}