var route = require("../index");
var main = require("./index");

/*
* response:{
    key:{activity_id}
    value:{type},
    next: next action
}
**/

const field = 'charge/type';
exports.process = function(recipientId, response){
    var activity_id = response.key;
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, activity_id, field, value, function(recipientId, value, activity){
        console.log('===save charge type:%s===', value);
        console.log('===next:%s===', next);
        switch(value){
            case 0:
                route.parsenext(next, function(nextaction, nextleft){
                    main.next(nextaction, recipientId, value, activity, nextleft);
                });
                break;
            case 1:
            case 2:
                main.requireField(recipientId, activity_id, 'charge/price', next);
                break;
            default:
                route.err(recipientId, 'Undefined type value:'+value);
        }
    });
}