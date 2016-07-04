var route = require("../index");
var main = require("./index");
var help = require("./help");
/*
* 
* response:{
    value: 0-male, 1-female, 2-all
    next: next action
}
**/

exports.process = function(recipientId, response){
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, 'gender', value, function(userPrefer){
        route.sendTextMessage(recipientId, '配對偏好已更新！', function(){
            route.parsenext(next, function(nextaction, nextleft){
            main.next(nextaction, recipientId, value, userPrefer, nextleft);
            });
        });
    });
}