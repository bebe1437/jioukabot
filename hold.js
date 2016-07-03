var reply = require('./reply');
var Update = require('./model/Update');
var Activity = require('./model/Activity');
var UserActivity = require('./model/UserActivity');
var User = require('./model/User');

function initActivity(user_id, fn){
  console.log('===hold.initActivity===');
  UserActivity.findAsHost(user_id, function(userActivity){
    if(userActivity){
      fn(userActivity.activity_id);
    }else{
      Activity.init(user_id, function(activity_id, activity, err){
        if(err){
          fn(null, err);
          return;
        }
        UserActivity.create(user_id, activity_id, activity, function(useractivity,err){
            fn(activity_id, err);
        });
      });
    }
  }); 
}

/*
 * 
 活動：哈囉！今天想到什麼好玩的嗎？
 位置：給個大概位置吧？城市名稱
 費用：費用怎麼算？免費、均攤、酬庸
 類別：給活動一個類別吧！例如：電影、吃飯...
 *
 */
exports.createField = function(recipientId, type) {
  console.log('===hold.createMessage===');
  
  var hold = this;
  initActivity(recipientId, function(activity_id, err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    
    var message;
    switch(type){
        case 'CONTENT':
            message = "哈囉！今天想到什麼好玩的嗎？";
            break;
        case 'TYPE':
            message = "給活動一個類別吧！例如：電影、吃飯...";
            break;
        case 'LOCATION':
            message = "給個大概位置吧？城市名稱";
            break;
        case 'CHARGE':
            hold.chargeMessage(recipientId);
            return;
        case 'CHARGE/PRICE':
            message = "那費用大概多少呢？";
            break;
        default:
            reply.err(recipientId, 'Not valid type for HOLD_CREATE:'+type);
            return;
    }
    console.log('Message:%s', message);
    var value = "HOLD.{type}${key}".replace("{type}", type).replace("{key}",activity_id);
    fieldMessage(recipientId, message, value); 
  });
}

exports.savefield = function(recipientId, tmpfield, message){
  console.log('===hold.savefield===');
  var tmp = tmpfield.split('$');
  var activity_id = tmp[1];
  var hold = this;
  
  UserActivity.findAsHost(recipientId, function(useractivity){
    if(!useractivity){
      reply.err(recipientId, 'Can not find activity:%s', activity_id);
      return;
    }
    
    var field = tmp[0];
    var value = message;
    
    save(recipientId, activity_id, field, value, function(next, err){
      if(err){
        reply.err(recipientId, err);
        return;
      };
      if(next){
        console.log('execute next field:%s', next);
        hold.createField(recipientId, next);
      }
    });    
  });
}

function save(recipientId, activity_id, field, field_value, fn){
  Update.activityFields(recipientId, activity_id, field.toLowerCase(), field_value);
  switch(field){
    case 'CONTENT':
      fn('TYPE');
      break;
    case 'TYPE':
      fn('LOCATION');
      break;
    case 'LOCATION':
      fn('CHARGE');
      break;
    default:
      fn(null, 'Undefined field:'+ field);
  }
}

exports.saveChargeField = function(recipientId, charge){
  var hold = this;
  initActivity(recipientId, function(activity_id, err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    var field = 'charge';
    switch(charge){
      case 'FREE':
        save(recipientId, activity_id, field, {
          type: 0,
          price: 0
        }, function(err){
          if(err){
            reply.err(recipientId, err);
            return;
          }
          UserActivity.findByKey(recipientId, activity_id, function(userActivity){
            hold.showMessage(recipientId, userActivity);
          });
        });
        break;
      case 'SHARE':
        saveCharge(recipientId, activity_id, 1);
        break;
      case 'POCKETMONEY':
        saveCharge(recipientId, activity_id, 2);
        break;
      default:
        reply.err(recipientId, 'Undefined charge:'+ charge);
    }
  });
}

function saveCharge(recipientId, activity_id, type){
  var field = 'charge';
  var fields = {
    type: type
  }
  var hold = this;
  save(recipientId, activity_id, field, fields, function(next, err){
    if(err){
      reply.err(recipientId, err);
    }else{
      hold.createField(recipientId, 'CHARGE/PRICE');
    }
  });
}


/*
 * [揪咖]
費用：免費、均攤、佣金
類別：電影、桌遊等關鍵字
地點：城市
活動：簡單講述活動內容
[取消] [停止配對]
 *
 */
exports.showMessage = function(recipientId, userActivity){
  userActivity.showCharge(function(str){
    var content = '『來揪咖吧』'
    .concat('\r\n').concat('費用：').concat(str)
    .concat('\r\n').concat('類別：').concat(userActivity.type)
    .concat('\r\n').concat('地點：').concat(userActivity.location)
    .concat('\r\n').concat('內容：').concat(userActivity.content); 
    reply.sendTextMessage(recipientId, content);
  });
}

/*
 * 
 活動：哈囉！今天想到什麼好玩的嗎？
 位置：給個大概位置吧？城市名稱
 費用：費用怎麼算？免費、均攤、酬庸
 類別：給活動一個類別吧！例如：電影、吃飯...
 *
 */
function fieldMessage(recipientId, messageText, userfield){
  console.log('===hold.fieldMessage===');
  console.log('user.field:%s', userfield);
  Update.holdUserField(recipientId, userfield);
  User.currentField(recipientId, function(field, err){
    if(field == userfield){
      reply.sendTextMessage(recipientId, messageText);
    }
  });
}

/*
 * show charge message
*/
exports.chargeMessage = function(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "費用怎麼算？免費、均攤、佣金",
          buttons:[{
            type: "postback",
            title: "免費",
            payload: "$HOLD_CHARGE.FREE"
          },{
            type: "postback",
            title: "均攤",
            payload: "$HOLD_CHARGE.SHARE"
          },{
            type: "postback",
            title: "佣金",
            payload: "$HOLD_CHARGE.POCKETMONEY"
          }]
        }
      }
    }
  };  
  Update.holdUserField(recipientId, "");
  reply.callSendAPI(messageData);
}