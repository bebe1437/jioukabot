var hold = require('./hold');
var reply = require('./reply');
var UserActivity = require('./model/UserActivity');

exports.postback = function(recipientId, command){
  switch(command){
    case '$HOLD':
        UserActivity.findAsHost(recipientId, function(userActivity){
            userActivity 
            ? hold.editMessage(recipientId, userActivity)
            : hold.createField(recipientId, 'CONTENT');
        });
        break;
    case '$HOLD_CHARGE.FREE':
    case '$HOLD_CHARGE.SHARE':
    case '$HOLD_CHARGE.POCKETMONEY':
        var charge = command.split('_')[1].split('.')[1];
        hold.saveChargeField(recipientId, charge);
        break;
    default:
        console.log('Not valid command:'+ command);
        reply.err(recipientId);
  }   
}

exports.savefield = function(recipientId, userfield, message){
  console.log('===command.savefield===');
   var tmp = userfield.split('.');
   var type = tmp[0];
   var field = tmp[1];
  
  console.log('type:%s, field:%s', type, field);
   switch(type){
        case 'HOLD':
            hold.savefield(recipientId, field, message);
            break;
        default:
            reply.err('Invalid field type:'+type);
   }
}