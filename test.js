var help = require('./route/match/help');
var User = require("./model/User");
var UserPrefer = require("./model/UserPrefer");
const user_id = '1155742751164216';


User.valid(user_id, function(user){
  var user_name = user.first_name;
  UserPrefer.find(user_id, function(userPrefer){
    help.editMessage(user_id, user_name, userPrefer);
  });
});

