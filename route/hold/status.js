var route = require("../index");
var main = require("./index");

/*
* change status
* response:{
    key:{activity_id}
    value: 0-created, 1-canceled, 2-stopmatch
    next: next action
}
**/

exports.process = function(recipientId, response){
    var activity_id = response.key;
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, activity_id, 'status', value, function(recipientId, value, activity){
        switch(value){
            case 0:
                route.sendTextMessage(recipientId, '已經幫你開啟配對囉XD');
                break;
            case 1:
                route.sendTextMessage(recipientId, '已經幫你取消揪團囉QQ(在地畫圈圈...)');
                return;
            case 2:
                route.sendTextMessage(recipientId, '已經幫你停止配對囉^_^');
                break;
            default:
                route.err(recipientId, 'Undefined status:'+value);
                return;
        }
        route.parsenext(next, function(nextaction, nextleft){
            main.next(nextaction, recipientId, value, activity, nextleft);
        });
    });
}