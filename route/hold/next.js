var route = require("../index");
var main = require("./index");
var Block = require("../../model/Block");
var Activity = require("../../model/Activity");
var db = require("../../model/db");

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
    var value = response.value;
    
    Block.create(activity_id, value, function(err){
      if(err){
        route.err(recipientId, err);
        return;
      }
      var updates = [];
      updates['/matches/'+activity_id+'_'+value+'/status'] = 1;
      db.update(updates);
      
      Activity.findByKey(activity_id, function(activity){
        main.matchUser(recipientId, activity_id,  activity);
      });
    });
}