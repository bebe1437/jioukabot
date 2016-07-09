var route = require("../index");
var Activity = require("../../model/Activity");
var UserPrefer = require("../../model/UserPrefer");
var Match = require("../../model/Match");
var Block = require("../../model/Block");
var db = require("../../model/db").get();

const routes={
    hold : require("../hold"),
    match: require("../match")
};

/*
* block match rely
* response:{
    key:{match_key}
    value: {block_id},
    next: hold/match
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
            
            
            Match.find(match_key, function(match){
                    if(match.next == 'hold'){
                        if(status == 2){
                            route.sendTextMessage(match.participant, '已經幫你關閉這個活動通訊囉！');
                        }
                        Activity.findByKey(activity_id, function(activity){
                            activity.activity_id = activity_id;
                            routes[match.next].findMatch(match.host, activity);
                        });
                    }else if(match.next == 'match'){
                        if(status == 1){
                            route.sendTextMessage(match.host, '已經幫你關閉這個活動通訊囉！');
                        }
                        UserPrefer.find(participant_id, function(UserPrefer){
                            routes[match.next].findMatch(match.participant, UserPrefer);
                        });
                    }
            });
        });
    });
}