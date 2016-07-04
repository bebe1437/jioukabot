var db = require("../../model/db").get();
var User = require("../../model/User");
var UserPrefer = require("../../model/UserPrefer");
var help = require("./help");
var route = require("../index");

const routes = {
  help: require("./help")
}
/*
 * payload:{
     route: 
     action: 
     response:
 }
*/
exports.process = function(recipientId, payload){
  routes[payload.action].process(recipientId, payload.response);
}

exports.save = function(recipientId, field, value, fn){
    var updates = {};
    var updated_time = Date.now();
    updates['/userprefer/{user_id}/{field}'.replace('{user_id}', recipientId).replace('{field}', field)] = value;
    updates['/userprefer/{user_id}/updated_time'.replace('{user_id}', recipientId)] = updated_time;
    db.update(updates);
    UserPrefer.find(recipientId, function(userPrefer){
        fn(userPrefer);
    });
}

exports.next = function(action, recipientId, value, userPrefer, next){
  switch(action){
    case 'edit':
      User.valid(recipientId, function(user){
          help.editMessage(recipientId, user.first_name, userPrefer);
        });
      break;
    default:
      route.err(recipientId, 'Undefineda action:' + action);
  }  
}