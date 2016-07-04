var route = require("../index");
var main = require("./index");
var UserActivity = require("../../model/UserActivity");
var Activity = require("../../model/Activity");
var User = require("../../model/User");
var Payload = require("../Payload");
var api = require("../api");


var UserPrefer = require("../../model/UserPrefer");

/*
* help
**/
exports.process = function(recipientId, response){
    var help = this;
    UserPrefer.find(recipientId, function(userPrefer){
        if(!userPrefer){
            route.err(recipientId, 'Can not find UserPrefer:'+recipientId);
            return;
        }
        User.valid(recipientId, function(user){
          help.editMessage(recipientId, user.first_name, userPrefer);
        });
        
    });
}

exports.editMessage = function(recipientId, user_name, userPrefer) {
  var content = user_name.concat(", 以下是你的配對設定：\r\n").concat(userPrefer.output);
  var next = 'edit';
  
  route.sendTextMessage(recipientId, content, function(){
       var main = {
        title: "設定",
        subtitle: "此開關為幫你找活動配對，跟你的揪咖開關無關喔＾＾",
        buttons:[{ type: "postback", title: userPrefer.status == 0 ? "停止配對":"開啟配對"
            , payload: Payload.matchtatus(userPrefer.status == 0 ? 1 : 0 , next).output}]
        }

      var charge = {
        title: "費用",
        subtitle: userPrefer.charge_output,
        buttons:[{ type: "postback", title: "免費", payload: Payload.matchcharge(0, next).output }
        ,{ type: "postback", title: "均攤", payload: Payload.matchcharge(1, next).output }
        ,{ type: "postback", title: "零用錢", payload: Payload.matchcharge(2, next).output }]
        }
        
      var gender = {
        title: "性別",
        subtitle: userPrefer.gender_output,
        buttons:[{ type: "postback", title: "限男", payload: Payload.matchgender(0, next).output}
        ,{ type: "postback", title: "限女", payload: Payload.matchgender(1, next).output}
        ,{ type: "postback", title: "不限", payload: Payload.matchgender(2, next).output}]
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
              elements: [main, charge, gender]
            }
          }
        }
      };  
    
      api.sendMessage(messageData);
  });
}