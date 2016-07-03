var command = require('./command');
var UserActivity = require('./model/UserActivity');
var user_id = '1155742751164216';


command.postback(user_id, '$HOLD'); 
//command.savefield(user_id, 'HOLD.LOCATION$8869c1f6-fdfa-405d-bcd4-d7d0b384e1b2', '台北'); 
//command.postback(user_id, '$HOLD_CHARGE.FREE');