var Payload = require('../Payload');
var route = require("../index");
var db = require("../../model/db").get();
var Activity = require("../../model/Activity");
var UserActivity = require("../../model/UserActivity");
var UserSys = require("../../model/UserSys");
var User = require("../../model/User");
var help = require("./help");

const routes = {
  help: require("./help"),
  charge: require("./charge"),
  gender: require("./gender"),
  field: require("./field")
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

exports.next = function(action, recipientId, value, activity, next){
  switch(action){
    case 'edit':
      UserSys.cleanField(recipientId, function(err){
        if(err){
          route.err(recipientId, err);
          return;
        }
        User.valid(recipientId, function(user){
          help.editMessage(recipientId, user.first_name, new UserActivity(activity));
        });
      });
      break;
    case 'show':
      var message = "哈囉！這是你的揪咖活動內容：\r\n".concat(new UserActivity(activity).output);
      UserSys.cleanField(recipientId, function(err){
        if(err){
          route.err(recipientId, err);
          return;
        }
        route.sendTextMessage(recipientId, message);
      });
      break;
    default:
      this.requireField(recipientId, activity.activity_id, action, next);
  }  
}

exports.save = function(recipientId, activity_id, field, value, fn){
    Activity.findByKey(activity_id, function(activity){
        if(!activity){
            route.err(recipientId, 'Can not find activity:'+activity_id);
            return;
        }
        var path1 = '/activities/{activity_id}/{field}'
        .replace('{activity_id}', activity_id)
        .replace('{field}', field);
        var path2 = '/useractivites/{user_id}_{timestamp}_{activity_id}/{field}'
            .replace('{user_id}', recipientId)
            .replace('{timestamp}', activity.created_time)
            .replace('{activity_id}', activity_id)
            .replace('{field}', field);
        
        var updates = {};
        updates[path1] = value; 
        updates[path2] = value;
        db.update(updates);
        
        Activity.findByKey(activity_id, function(activity){
          activity.activity_id = activity_id;
          fn(recipientId, value, activity);
        });
    });
}

exports.requireField = function(recipientId, activity_id, field, next) {
    var message;
    switch(field){
        case 'content':
            message = "哈囉！今天想到什麼好玩的嗎？";
            break;
        case 'type':
            message = "給活動一個類別吧！例如：電影、吃飯...";
            break;
        case 'location':
            message = "給個大概位置吧？城市名稱";
            break;
        case 'gender':
            this.genderMessage(recipientId, activity_id, next);
            return;
        case 'charge':
            this.chargeMessage(recipientId, activity_id, next);
            return;
        case 'charge/price':
            message = "那費用大概多少呢？";
            break;
        default:
            route.err(recipientId, 'Not valid type for HOLD_CREATE:'+field);
            return;
    }
    var userfield = {
      route: 'hold',
      key: activity_id,
      field: field,
      next: next
    }
    route.requireFieldMessage(recipientId, message, userfield);
}

/*
 * show gender message
*/
exports.genderMessage = function(recipientId, activity_id, next){
  
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "有指定配對性向嗎？",
          buttons:[{
            type: "postback",
            title: "限男",
            payload: Payload.gender(activity_id, 0, next).output
          },{
            type: "postback",
            title: "限女",
            payload: Payload.gender(activity_id, 1, next).output
          },{
            type: "postback",
            title: "不限",
            payload: Payload.gender(activity_id, 2, next).output
          }]
        }
      }
    }
  };
  
  route.cleanFieldMessage(recipientId, messageData);
}


/*
 * show charge message
*/
exports.chargeMessage = function(recipientId, activity_id, next){
  
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "費用怎麼算？免費、均攤、零用錢",
          buttons:[{
            type: "postback",
            title: "免費",
            payload: Payload.charge(activity_id, 0, next).output
          },{
            type: "postback",
            title: "均攤",
            payload: Payload.charge(activity_id, 1, next).output
          },{
            type: "postback",
            title: "零用錢",
            payload: Payload.charge(activity_id, 2, next).output
          }]
        }
      }
    }
  }; 
  
  route.cleanFieldMessage(recipientId, messageData);
}