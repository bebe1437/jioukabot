var route = require("../index");
var main = require("./index");

/*
* change status
* response:{
    value: 0-available, 1-unavailable
    next: next action
}
**/

exports.process = function(recipientId, response){
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, '' , 'status', value, function(recipientId, value, userPrefer){
        console.log('test:%s', JSON.stringify(userPrefer));
        switch(value){
            case 0:
                route.sendTextMessage(recipientId, '已經幫你開啟配對囉XD');
                break;
            case 1:
                route.sendTextMessage(recipientId, '已經幫你取消配對囉(在地上畫圈圈...)');
                break;
            default:
                route.err(recipientId, 'Undefined status:'+value);
                return;
        }
        route.parsenext(next, function(nextaction, nextleft){
            main.next(nextaction, recipientId, value, userPrefer, nextleft);
        });
    });
}