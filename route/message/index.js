var Payload = require('../Payload');
var route = require("../index");
var Message = require("../../model/Message");
var api = require("../api");

const routes = {
  reply: require("./reply"),
  block: require("./block")
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

exports.save = function(recipientId, activity_id, receive_id, value, fn){
  var main = this;
  Message.create(activity_id, recipientId, {
    receive_id: receive_id,
    content: value
  }, function(msg, err){
    if(err){
      route.err(recipientId, err);
      return;
    }
    main.replyMessage(activity_id, recipientId, receive_id, value);
  });
}

exports.requireField = function(recipientId, activity_id, receive_id) {
    var message = "有什麼可以幫你轉告的嗎？(限文字訊息喔）";
    var userfield = {
      route: 'message',
      key: activity_id,
      field: receive_id
    }
    route.requireFieldMessage(recipientId, message, userfield);
}

exports.replyMessage = function(match_key, sender, receive_id, msg){
      var buttons =[
        {
            type: "postback",
            title: "回覆",
            payload: Payload.matchreply(match_key, sender.user_id).output
        },{
            type: "postback",
            title: "封鎖",
            payload: Payload.matchreject(match_key, sender.user_id).output
        }
      ];
       var participant = {
        title: '[{gender}]{name}'.replace('{gender}', sender.gender?'女':'男').replace('{name}', sender.first_name),
        subtitle: msg,
        image_url: sender.profile_pic,
        buttons: buttons
        }
        
      var messageData = {
        recipient: {
          id: receive_id
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [participant]
            }
          }
        }
      };  
    
      api.sendMessage(messageData);  
}