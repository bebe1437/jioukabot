var route = require("../index");
var main = require("./index");
var Match = require("../../model/Match");

/*
* reply to match user
* response:{
    key:{activity_id}_{participant_id}
    value: response_user_id,
    next: next action
}
**/

exports.process = function(recipientId, response){
    var match_key = response.key;
    var value = response.value;
    
    Match.find(match_key, function(match){
        if(!match){
            route.err(recipientId, 'Can not find match data:'+ match_key);
            return;
        }
        switch(match.status){
            case 0:
                main.requireField(recipientId, match_key, value);
                break;
            default:
                route.sendTextMessage(recipientId, '喔！配對通訊已經被關閉囉...一"一');
        }
    });
}