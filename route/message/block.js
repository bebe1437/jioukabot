var route = require("../index");
var hold = require("../hold");
var Activity = require("../../model/Activity");
var Block = require("../../model/Block");
var db = require("../../model/db").get();

/*
* block match rely
* response:{
    key:{match_key}
    value: {block_id}
}
**/

exports.process = function(recipientId, response){
    var match_key = response.key;
    var activity_id = match_key.split('_')[0];
    var participant_id = match_key.split('_')[1];
    var block_id = response.value;
    
    Block.create(activity_id, participant_id, function(err){
        if(err){
            route.err(recipientId, err);
            return;
        }
        Block.create(participant_id, activity_id, function(err){
            if(err){
                route.err(recipientId, err);
                return;
            }
            var status = block_id == participant_id ? 1 : 2;
            var updates = [];
            updates['/matches/'+match_key+'/status'] = status;
            db.update(updates);
            
            if(status == 1){
                Activity.findByKey(activity_id, function(activity){
                    hold.matchUser(recipientId, activity_id,  activity);
                });
            }else{
                route.sendTextMessage(participant_id, '已經幫你關閉這個活動通訊囉！');
            }
        });
    });
}