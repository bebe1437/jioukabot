var route = require("../index");
var main = require("./index");
var api = require("../api");
var User = require("../../model/User");

/*
* requireField
* response:{
    key:{activity_id}
    value:{type},
    next: next action
}
**/

exports.process = function(recipientId, response){
    var activity_id = response.key;
    var value = response.value;
    var next = response.next;
    
    var attend = this;
    User.valid(recipientId, function(user){
        attend.listMessage(recipientId, user);
    });
}

exports.listMessage = function(recipientId, user) {
  
  var buttons = [
    { type:"postback", title:"回覆", payload:"test"},
    { type:"postback", title:"刪除", payload:"test"}
    ];
  //route.sendTextMessage(recipientId, content, function(){
       var participant = {
        title: "[{gender}] {name}".replace('{name}', user.first_name).replace('{gender}', user.gender?'女':'男'),
        subtitle: "哈囉你好嗎？衷心感謝，珍重再見，期待再相逢。哈囉你好嗎？衷心感謝，珍重再見，期待再相逢。哈囉你好嗎？衷心感謝，珍重再見，期待再相逢。哈囉你好嗎？衷心感謝，珍重再見，期待再相逢。哈囉你好嗎？衷心感謝，珍重再見，期待再相逢。",
        image_url: user.profile_pic,
        buttons: buttons
        }
        
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [participant, participant, participant, participant]
            }
          }
        }
      };  
    
      api.sendMessage(messageData);
  //});
}
