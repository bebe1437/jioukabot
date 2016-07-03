var UserSys = require('../model/UserSys');
var route = require("../route");
var Sync = require("sync");
const user_id = '1155742751164216';

var payload = "{\"route\":\"hold\",\"action\":\"help\"}";

//locak same payload in 5 seconds
Sync(function(){
      UserSys.setPostback(user_id, payload, function(err){
        if(err){
          route.err(err);
          return;
        }
        route.postback(user_id, JSON.parse(payload));
      }); 
      
      UserSys.setPostback(user_id, payload, function(err){
        if(err){
          route.err(err);
          return;
        }
        route.postback(user_id, JSON.parse(payload));
      }); 
});