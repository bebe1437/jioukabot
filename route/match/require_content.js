var route = require("../index");
var main = require("./index");
var help = require("./help");
/*
* change status
* response:{
    next: next action
}
**/

exports.process = function(recipientId, response){
    var next = response.next;
    
   main.requireField(recipientId, 'content', next);
}