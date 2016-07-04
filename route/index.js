var UserSys = require('../model/UserSys');
var api = require('./api');

const routes={
  hold: require('./hold')
}

/*
* userfield:{
  route:
  key:,
  field:,
  next: next action ext: type.location.gender.show
}

*/
exports.savefield = function(recipientId, userfield, message){
  console.log('===route.savefield===:%s', JSON.stringify(userfield));
  var key = userfield.key;
  var field = userfield.field;
  var action = routes[userfield.route];
  
  console.log('===route[%s] save field[%s]:%s===', userfield.route, field, message);
  var route = this;
  action.save(recipientId, key, field, message, function(recipientId, value, obj){
    route.parsenext(userfield.next, function(nextaction, nextleft){
      console.log('===route[%s] action:%s, next:%s===', userfield.route, nextaction, nextleft);
      action.next(nextaction, recipientId, value, obj, nextleft);
    });
  });
}

exports.parsenext = function(next, fn){
  if(next){
    var nexts = next.split('.');
    var nextaction = nexts[0];
    var nextleft = nexts.length>1? next.replace(nextaction+'.', '')  : undefined;
    fn(nextaction, nextleft);    
  }
}

/*
 * payload:{
     route: 
     action: 
     response:
 }
*/
exports.postback = function(recipientId, payload){
  console.log('===route.postback:%s==', JSON.stringify(payload));
  routes[payload.route].process(recipientId, payload);
}

/*
 * err: Invalid Operation
 *
 */
exports.err = function(recipientId, err){
  console.error('Invalid Operation[%s]:%s',recipientId, err);
  this.sendTextMessage(recipientId, "Invalid Operation"); 
} 

/*
 * invalid user
 *
 */
exports.invalidUser = function(recipientId, err){
  console.error('Invalid User[%s]:%s',recipientId, err);
  this.sendTextMessage(recipientId, "Invalid User, we got problem to retrive your user information."); 
} 

/*
 * reply random message
 *
 */
exports.randomMessage = function(recipientId, messageText){
  this.sendTextMessage(recipientId, '你是說'+messageText+'嗎？請輸入help/幫助.'); 
} 


/*
 * reply attach message
 *
 */
exports.responseAttach = function(recipientId){
  this.sendTextMessage(recipientId, '喔! 我收到囉^_^'); 
}

/*
 * Send a text message using the Send API.
 *
 */
exports.sendTextMessage = function(recipientId, messageText, callback) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  api.sendMessage(messageData, callback);  
}

/*
 * Help
 *
 */
exports.helpMessage = function(recipientId){
  var payload = {
    route: '{value}',
    action: 'help'
  }
  payload = JSON.stringify(payload);
  
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "歡迎來到揪咖吧！",
          buttons:[{
            type: "postback",
            title: "揪咖",
            payload: payload.replace('{value}', 'hold')
          },{
            type: "postback",
            title: "參咖",
            payload: payload.replace('{value}', 'attend')
          }]
        }
      }
    }
  };  

  api.sendMessage(messageData);    
}

exports.sendButtonMessage = function(recipientId, text, buttons){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    }
  };  

  api.sendMessage(messageData);
}

/*
 * Require field message
*/
exports.requireFieldMessage = function(recipientId, messageText, userfield){
  var reply = this;
  UserSys.setField(recipientId, userfield, function(err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    reply.sendTextMessage(recipientId, messageText);
  });
}

exports.cleanFieldMessage = function(recipientId, messageData){
  var route = this;
  UserSys.cleanField(recipientId, function(err){
    if(err){
      route.err(recipientId, err);
      return;
    }
    api.sendMessage(messageData);
  });  
}