var db = require("./db").get();
var User = require('./User');
var Activity = require('./Activity');

exports.holdUserField = function(user_id, value){
    console.log('===Update.holdUserField===');
    console.log('user.field value to save :%s', value);
    var userfield_path = "/users/{user_id}/field".replace("{user_id}", user_id);
    console.log('user.field path:%s', userfield_path);
    var updates = {};
    updates[userfield_path] = value;
    db.update(updates);
    
    User.currentField(user_id, function(field, err){
        console.log('User.currentField:%s', field);
        if( field == value){
            var logpath = '/logs'+userfield_path+"_"+Date.now();
            console.log('log path:%s', logpath);
            var ref = db.database().ref(logpath);
            ref.set(value, function(err){
                if(err){
                    console.log('logs error:%s', err);
                }
            });
        }
    });
};

exports.activityFields = function(user_id, activity_id, field, value){
    console.log('===Update.activityFields===');
    Activity.findByKey(activity_id, function(activity){
        if(activity){
            var key = user_id+"_"+activity.created_time+"_"+activity_id;
            var updates = {};
            updates['/activities/'+activity_id +"/"+field] = value;
            updates['/useractivites/'+key+"/"+field] = value;   
            db.update(updates);
        }
    });
}