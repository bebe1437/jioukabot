var route = require('./route');
var api = require('./route/api');
var Payload = require('./route/Payload');
var constants = require("./constants");
var UserActivity = require("./model/UserActivity");
const user_id = '1155742751164216';

UserActivity.findAsHost(user_id,  function(userActivity){
  editMessage(user_id, 'Phoebe', userActivity);
  
});

function editMessage(recipientId, user_name, userActivity) {
  var content = user_name.concat(", 以下是你目前的揪咖內容：\r\n").concat(userActivity.output);
  var activity_id = userActivity.activity_id;
  var next = 'edit';
  
  route.sendTextMessage(user_id, content, function(){
       var main = {
        title: "設定",
        subtitle: userActivity.charge_output,
        buttons:[{ type: "postback", title: "停止配對", payload:"test"}
        ,{ type: "postback", title: "取消揪咖", payload:"test"}]
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
     
       var type = {
        title: "類別",
        subtitle: userActivity.type,
        buttons:[{ type: "postback", title: "編輯", payload: Payload.holdfield(activity_id, 'type', next).output }]
        }   
      
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
              elements: [main, charge, gender, type, location, content]
            }
          }
        }
      };  
    
      api.sendMessage(messageData);
  });
}