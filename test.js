var help = require('./route/attend/help');
var User = require("./model/User");
const user_id = '1155742751164216';


User.valid(user_id, function(user){
  help.editMessage(user_id, user);
});