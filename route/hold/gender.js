var route = require("../index");
var main = require("./index");

/*
* response:{
    key:{activity_id}
    value:{gender},
    next: next action
}
**/

const field = 'gender';
exports.process = function(recipientId, response){
    var activity_id = response.key;
    var value = response.value;
    var next = response.next;
    
    main.save(recipientId, activity_id, field, value, function(recipientId, value, activity){
        route.parsenext(next, function(nextaction, nextleft){
            main.next(nextaction, recipientId, value, activity, nextleft);
        });
    });
}