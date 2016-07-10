var route = require("../index");
var main = require("./index");
var Block = require("../../model/Block");
var Activity = require("../../model/Activity");
var UserPrefer = require("../../model/UserPrefer");
var db = require("../../model/db").get();

/*
* find next match user
* response:{
    key:{match_key}
    next: next action
}
**/

exports.process = function(recipientId, response){
    var match_key = response.key;
    var activity_id = match_key.split('_')[0];
    
    Block.create(recipientId, activity_id , function(err){
      if(err){
        route.err(recipientId, err);
        return;
      }
      var updates = {};
      updates['/matches/'+match_key+'/status'] = 2;
      db.update(updates);
      
      UserPrefer.find(recipientId, function(userPrefer){
        main.findMatch(recipientId, userPrefer);
      });
    });
}