var route = require("../index");
var main = require("./index");

/*
* requireField
* response:{
    key:{activity_id}
    value:{type},
    next: next action
}
**/

exports.process = function(recipientId, response){
    var activity_id = response.key;
    var value = response.value;
    var next = response.next;
    main.requireField(recipientId, activity_id, value, next);
}