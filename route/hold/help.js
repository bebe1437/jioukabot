var route = require("../index");
var main = require("./index");
var UserActivity = require("../../model/UserActivity");
var Activity = require("../../model/Activity");
var User = require("../../model/User");
var Payload = require("../Payload");
var api = require("../api");

/*
* help
**/
exports.process = function(recipientId, response){
    var help = this;
    UserActivity.findAsHost(recipientId, function(userActivity){
        userActivity 
        ? User.valid(recipientId, function(user){
            help.editMessage(recipientId, user.first_name,  userActivity)
        })
        : help.createMessage(recipientId);
    });
}

exports.createMessage = function(recipientId){
    Activity.init(recipientId, function(activity_id, activity, err){
        UserActivity.create(recipientId, activity_id, activity, function(useractivity, err){
           main.requireField(recipientId, activity_id, 'content', 'location.gender.charge.show'); 
        });
    });
}

exports.editMessage = function(recipientId, user_name, userActivity) {
  var content = user_name.concat(", 以下是你目前的揪咖內容：\r\n").concat(userActivity.output);
  var activity_id = userActivity.activity_id;
  var next = 'edit';
  
  route.sendTextMessage(recipientId, content, function(){
     var main = {
        title: "設定",
        subtitle: "每人一次只能揪一個活動喔！",
        buttons:[
            { type: "postback", title: "參咖列表", payload: Payload.holdattend(activity_id).output},
            { type: "postback", title: userActivity.status == 0 ? "停止配對":"開啟配對"
            , payload: Payload.holdstatus(activity_id, userActivity.status == 0 ? 2:0 , next).output},
            { type: "postback", title: "取消揪咖", payload: Payload.holdstatus(activity_id, 1).output}
        ]
    }

      var charge = {
        title: "費用",
        subtitle: userActivity.charge_output,
        buttons:[{ type: "postback", title: "免費", payload: Payload.charge(activity_id, 0, next).output }
        ,{ type: "postback", title: "均攤", payload: Payload.charge(activity_id, 1, next).output }
        ,{ type: "postback", title: "零用錢", payload: Payload.charge(activity_id, 2, next).output }]
        }
        
      var gender = {
        title: "性別",
        subtitle: userActivity.gender_output,
        buttons:[{ type: "postback", title: "限男", payload: Payload.gender(activity_id, 0, next).output}
        ,{ type: "postback", title: "限女", payload: Payload.gender(activity_id, 1, next).output}
        ,{ type: "postback", title: "不限", payload: Payload.gender(activity_id, 2, next).output}]
        }    
/*     
       var type = {
        title: "類別",
        subtitle: userActivity.type,
        buttons:[{ type: "postback", title: "編輯", payload: Payload.holdfield(activity_id, 'type', next).output }]
        }   
*/      
       var location = {
        title: "地點",
        subtitle: userActivity.location,
        buttons:[{ type: "postback", title: "編輯", payload: Payload.holdfield(activity_id, 'location', next).output }]
        }
        
       var content = {
        title: "內容",
        subtitle: userActivity.content,
        buttons:[{ type: "postback", title: "編輯", payload: Payload.holdfield(activity_id, 'content', next).output }]
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
              elements: [main, charge, gender, location, content]
            }
          }
        }
      };  
    
      api.sendMessage(messageData);
  });
}