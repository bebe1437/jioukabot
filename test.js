var route = require('./route');
var UserActivity = require("./model/UserActivity");
const user_id = '1155742751164216';

UserActivity.findAsHost(user_id, function(useractivity){
  route.sendTextMessage(user_id, useractivity.output);
  var buttons = [{
              type: "postback",
              title: "免費",
              payload: "Developer defined postback"
            }, {
              type: "postback",
              title: "均攤",
              payload: "Developer defined postback"
            }, {
              type: "postback",
              title: "零用錢",
              payload: "Developer defined postback"
            }];
            
  route.sendButtonMessage(user_id, "費用: 免費", buttons);
  buttons = [{
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
            
  route.sendButtonMessage(user_id, "性別: 限女", buttons);  
});