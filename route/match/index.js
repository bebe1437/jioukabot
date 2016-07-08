var db = require("../../model/db").get();
var User = require("../../model/User");
var UserPrefer = require("../../model/UserPrefer");
var help = require("./help");
var route = require("../index");

const routes = {
  help: require("./help"),
  charge: require("./charge"),
  gender: require("./gender"),
  status: require("./status"),
  require_content: require("./require_content"),
  content: require("./content")
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

exports.save = function(recipientId, key, field, value, fn){
    var updates = {};
    var updated_time = Date.now();
    updates['/userprefer/{user_id}/{field}'.replace('{user_id}', recipientId).replace('{field}', field)] = value;
    updates['/userprefer/{user_id}/updated_time'.replace('{user_id}', recipientId)] = updated_time;
    db.update(updates);
    UserPrefer.find(recipientId, function(userPrefer){
        fn(recipientId, value, userPrefer);
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

exports.requireField = function(recipientId, field, next) {
    var message;
    switch(field){
        case 'content':
            message = "哈囉！想要參加什麼活動呢？";
            break;
        default:
            route.err(recipientId, 'Not valid type for HOLD_CREATE:'+field);
            return;
    }
    var userfield = {
      route: 'match',
      field: field,
      next: next
    }
    route.requireFieldMessage(recipientId, message, userfield);
}