var route = require("../index");
var main = require("./index");
var UserActivity = require("../../model/UserActivity");
var Activity = require("../../model/Activity");

/*
* help
**/
exports.process = function(recipientId, response){
    var help = this;
    UserActivity.findAsHost(recipientId, function(userActivity){
        userActivity 
        ? help.editMessage(recipientId, userActivity)
        : help.createMessage(recipientId);
    });
}

exports.createMessage = function(recipientId){
    Activity.init(recipientId, function(activity_id, activity, err){
        UserActivity.create(recipientId, activity_id, activity, function(useractivity, err){
           main.requireField(recipientId, activity_id, 'content', 'type.location.gender.charge.show'); 
        });
    });
}

exports.editMessage = function(recipientId, userActivity) {
    var payload = {
        route: 'hold',
        action: '{value}',
        response:{
            key: userActivity.activity_id
        }
    }
    payload = JSON.stringify(payload);
    
    var content = userActivity.output;
    var buttons = [
        { type: 'postback', title: '編輯揪咖', payload: payload.replace('{value}', 'edit')},
        { type: 'postback', title: '停止配對', payload: payload.replace('{value}', 'stopmatch')}
    ];
    route.sendButtonMessage(recipientId, content, buttons);
}