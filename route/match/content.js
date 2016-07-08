var route = require("../index");
var main = require("./index");

/*
* change status
* response:{
    value: content
    next: next action
}
**/

exports.process = function(recipientId, response){
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, 'content', value, function(userPrefer){
        route.sendTextMessage(recipientId, '已經幫你更新搜尋條件囉XD', function(){
            route.parsenext(next, function(nextaction, nextleft){
                main.next(nextaction, recipientId, value, userPrefer, nextleft);
            }); 
        });
    });
}