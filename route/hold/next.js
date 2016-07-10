var route = require("../index");
var main = require("./index");
var Block = require("../../model/Block");
var Activity = require("../../model/Activity");
var db = require("../../model/db").get();

/*
* find next match user
* response:{
    key:{activity_id}
    value:block_user_id,
    next: next action
}
**/

exports.process = function(recipientId, response){
    var activity_id = response.key;
    var participant_id = response.value;
    var match_key = activity_id+'_'+participant_id;
    
    Block.create(activity_id, participant_id, function(err){
      if(err){
        route.err(recipientId, err);
        return;
      }
      var updates = {};
      updates['/matches/'+match_key+'/status'] = 1;
      db.update(updates);
      
      Activity.findByKey(activity_id, function(activity){
        activity.activity_id = activity_id;
        main.findMatch(recipientId, activity);
      });
    });
}