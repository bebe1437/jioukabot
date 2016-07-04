var route = require('./route');
var User = require("./model/User");
var UserActivity = require("./model/UserActivity");
const user_id = '1155742751164216';

UserActivity.findAsHost(user_id, function(useractivity){
  User.valid(user_id, function(user){
    var message = "哈囉！這是你的揪咖活動內容："
    .concat("\r\n").concat(useractivity.output);
    
    var buttons = [{
              type: "postback",
              title: "限男",
              payload: "Developer defined postback"
            }, {
              type: "postback",
              title: "限女",
              payload: "Developer defined postback"
            }, {
              type: "postback",
              title: "不限",
              payload: "Developer defined postback"
            }];
            
    route.sendButtonMessage(user_id, message , buttons);  
  });
});