var route = require("../index");
var main = require("./index");
var help = require("./help");
/*
* change status
* response:{
    value: 0-free, 1-share, 2-allowance
    next: next action
}
**/

exports.process = function(recipientId, response){
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, 'charge', value, function(userPrefer){
        route.sendTextMessage(recipientId, '配對偏好已更新！', function(){
            route.parsenext(next, function(nextaction, nextleft){
            main.next(nextaction, recipientId, value, userPrefer, nextleft);
            });
        });
    });
}