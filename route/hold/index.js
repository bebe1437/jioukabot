var Payload = require('../Payload');
var route = require("../index");
var db = require("../../model/db").get();
var Activity = require("../../model/Activity");
var UserActivity = require("../../model/UserActivity");
var UserSys = require("../../model/UserSys");
var User = require("../../model/User");
var Block = require("../../model/Block");
var Match = require("../../model/Match");
var help = require("./help");
var api = require("../api");

const routes = {
  help: require("./help"),
  charge: require("./charge"),
  gender: require("./gender"),
  field: require("./field"),
  status: require('./status'),
  attend: require("./attend"),
  next: require("./next")
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
    var main = this;
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
          var field_name = field == 'charge/type' ? 'charge': field;
          if(field_name == 'charge/price'){
            fn(recipientId, value, activity);
            return;
          }
          api.updateDoc('activities', activity_id, field_name, value, function(err, res){
            if(err){
              route.err(recipientId, err);
              return;
            }
            fn(recipientId, value, activity);
            
            if(activity.content
            && activity.charge
            && activity.gender
            && activity.location
            && activity.status == 0){
              setTimeout(function(){
                main.findMatch(recipientId, activity);
              }, 5000);
            }
          });
        });
    });
}

exports.requireField = function(recipientId, activity_id, field, next) {
    var message;
    switch(field){
        case 'content':
            message = "哈囉！今天想到什麼好玩的嗎？";
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
*/


exports.genderMessage = function(recipientId, activity_id, next){
  var messageData = {
    recipient:{
      id: recipientId
    },
    message:{
      text:"有指定配對性向嗎？",
      "quick_replies":[
        {
          content_type:"text",
          title:"限男",
          payload: Payload.gender(activity_id, 0, next).output
        },{
          content_type:"text",
          title:"限女",
          payload: Payload.gender(activity_id, 1, next).output
        },{
          content_type:"text",
          title:"不限",
          payload: Payload.gender(activity_id, 2, next).output
        }
      ]
    }
  }
  route.cleanFieldMessage(recipientId, messageData);
}


/*
 * show charge message

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
*/

exports.chargeMessage = function(recipientId, activity_id, next){
  var messageData = {
    recipient:{
      id: recipientId
    },
    message:{
      text:"費用怎麼算哩？",
      "quick_replies":[
        {
          content_type:"text",
          title:"免費",
          payload: Payload.charge(activity_id, 0, next).output
        },{
          content_type:"text",
          title:"付費",
          payload: Payload.charge(activity_id, 1, next).output
        },{
          content_type:"text",
          title:"零用錢",
          payload: Payload.charge(activity_id, 2, next).output
        }
      ]
    }
  }
  route.cleanFieldMessage(recipientId, messageData);
}

exports.findMatch = function(recipientId,  activity){
  var main = this;
  var activity_id = activity.activity_id;
  Block.list(activity_id, function(block_list){
    Match.scanUser(activity_id, function(participants){
      block_list.concat(participants);
      console.log('===mathcUser block_list:%s===', block_list);
      api.searchUsers(recipientId, activity, block_list, function(hits, err){
        if(err){
          console.error('fail to search in elasticsearch:%s', err);
          return;
        }
        if(hits.total==0){
          route.sendTextMessage(recipientId, '揪咖繼續幫你找咖囉^_^');
          return;
        }
        User.valid(hits.obj.user_id, function(matchUser, err){
          matchUser.user_id = hits.obj.user_id;
          User.valid(recipientId, function(user, err){
             user.user_id = recipientId;
             Match.create(user, matchUser, activity_id, 'hold', function(match ,err){
               if(err){
                 route.err(recipientId, err);
                 return;
               }
               main.matchMessage(recipientId, activity_id, matchUser, hits.obj.content);
             });
          });
        });
      });       
    });
  });
}

exports.matchMessage = function(recipientId, activity_id, matchedUser, msg){
      var buttons =[
        {
            type: "postback",
            title: "回覆",
            payload: Payload.matchreply(activity_id+'_'+matchedUser.user_id, matchedUser.user_id).output
        },{
            type: "postback",
            title: "下一位",
            payload: Payload.holdnext(activity_id, matchedUser.user_id).output
        }
      ];
       var participant = {
        title: '跟{gender}打聲招呼吧～'.replace('{gender}', matchedUser.gender?'妹':'哥'),
        subtitle: "[{gender}] {name}：{msg}"
        .replace('{name}', matchedUser.first_name)
        .replace('{gender}', matchedUser.gender?'女':'男')
        .replace('{msg}', msg),
        image_url: matchedUser.profile_pic,
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
              elements: [participant]
            }
          }
        }
      };  
    
      api.sendMessage(messageData);  
}