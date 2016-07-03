var reply = require('./reply');
var Update = require('./model/Update');
var Activity = require('./model/Activity');
var UserSys = require('./model/UserSys');
var UserActivity = require('./model/UserActivity');

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
        case 'GENDER':
            hold.genderMessage(recipientId);
            return;
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
    var value = "HOLD.{type}${key}".replace("{type}", type).replace("{key}",activity_id);
    reply.requireFieldMessage(recipientId, message, value);
  });
}

exports.savefield = function(recipientId, tmpfield, message){
  console.log('===hold.savefield===');
  var tmp = tmpfield.split('$');
  var activity_id = tmp[1];
  var hold = this;
  
  var field = tmp[0];
  var value = message;
  save(recipientId, activity_id, field, value, function(next, err){
      if(err){
        reply.err(recipientId, err);
        return;
      }
      if(next){
        console.log('Create next field:%s', next);
        hold.createField(recipientId, next);
        return;
      }
      UserSys.cleanField(recipientId, function(err){
        if(err){
          reply.err(recipientId, err);
          return;
        }
        UserActivity.findByKey(recipientId, activity_id, function(userActivity){
          reply.sendTextMessage(recipientId, userActivity.output);
        });
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
      fn('GENDER');
      break;
    case 'GENDER':
      fn('CHARGE');
    case 'CHARGE/TYPE':
      fn('CHARGE/PRICE');
      break;
    case 'CHARGE/PRICE':
      fn();
      break;
    default:
      fn(null, 'Undefined field:'+ field);
  }
}

exports.saveChargeField = function(recipientId, charge){
  console.log('===hold.saveChargeField:%s===', charge)
  var hold = this;
  initActivity(recipientId, function(activity_id, err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    switch(charge){
      case 'FREE':
        save(recipientId, activity_id, 'charge', {
          type: 0,
          price: 0
        }, function(err){
          if(err){
            reply.err(recipientId, err);
            return;
          }
          UserActivity.findByKey(recipientId, activity_id, function(userActivity){
            reply.sendTextMessage(recipientId, userActivity.output);
          });
        });
        break;
      case 'SHARE':
      case 'POCKETMONEY':
        var charge_type = charge == 'SHARE' ? 1 : 2;
        save(recipientId, activity_id, 'CHARGE/TYPE', charge_type, function(next, err){
          if(err){
            reply.err(recipientId, err);
            return;
          }
          hold.createField(recipientId, next);
        });
        break;
      default:
        reply.err(recipientId, 'Undefined charge:'+ charge);
    }
  });
}

exports.saveGenderField = function(recipientId, gender){
  console.log('===hold.saveGenderField:%s===', gender)
  var hold = this;
  initActivity(recipientId, function(activity_id, err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    
    var sex;
    switch(gender.toLowerCase()){
      case 'all':
        sex = 2;
        break;
      case 'female':
        sex = 1;
        break;
      case 'male':
        sex = 0;
        break;
      default:
        reply.err(recipientId, 'Undefined gender:%s', gender);
        return;
    }
    save(recipientId, activity_id, 'gender', sex, function(err){
      if(err){
        reply.err(recipientId, err);
        return;
      }
      hold.createField(recipientId, 'CHARGE');
    });
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
          text: "費用怎麼算？免費、均攤、零用錢",
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
  //Update.holdUserField(recipientId, "");
  UserSys.cleanField(recipientId, '', function(err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    reply.callSendAPI(messageData);
  });
}

/*
 * show gender message
*/
exports.genderMessage = function(recipientId){
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
            payload: "$HOLD_GENDER.MALE"
          },{
            type: "postback",
            title: "限女",
            payload: "$HOLD_GENDER.FEMALE"
          },{
            type: "postback",
            title: "不限",
            payload: "$HOLD_GENDER.ALL"
          }]
        }
      }
    }
  };
  UserSys.cleanField(recipientId, function(err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    reply.callSendAPI(messageData);
  });
}


exports.editMessage = function(recipientId) {
  UserActivity.findAsHost(recipientId, function(userActivity){
    var content = userActivity.output;
    var activity_id = userActivity.activity_id;
    reply.sendButtonMessage(recipientId, content, [
      {type:'postback', title:'編輯揪咖', payload:'$HOLD_EDIT$'+activity_id},
      {type:'postback', title:'停止配對', payload:'$HOLD_STOP$'+activity_id},
      {type:'postback', title:'取消揪咖', payload:'$HOLD_CANCEL$'+activity_id}
    ]);
  });
}

exports.testMessage = function(recipientId, message){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      text: message,
      quick_replies:[{
        content_type: 'text',
        title: '免費',
        payload: '$HOLD_CHARGE.FREE'
      },{
        content_type: 'text',
        title: '均攤',
        payload: '$HOLD_CHARGE.SHARE'
      },{
        content_type: 'text',
        title: '零用錢',
        payload: '$HOLD_CHARGE.POCKETMONEY'
      }]
    }
  };

  reply.callSendAPI(messageData);
}