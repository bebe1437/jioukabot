var db = require("./db").get();
var uuid = require('node-uuid');
var User = require("./User");
var api = require('../route/api');

/*global Activity
* key: {activity_id}
{
    host:{user_id},
    host_gender:,
    status: 0-created, 1-canceled, 2-stopmatch
    content: 來去看電影吧,
    location: 台北,
    locale:,
    gender: 0-male, 1-female, 2-all
    img_url: 
    charge:{
        type: 0-free, 1-godutch, 2-allowance
        price: 100
    }
    receipt_id:{receipt_id},
    participant_limit: 1-default, n-charged,
    created_time:timestamp
}
*/
module.exports = Activity;
function Activity(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

Activity.create = function(user_id, activity, fn){
    var activity_id = uuid.v4();
    activity.created_time = Date.now();
    console.log('Create Activity[%s]:%s', activity_id, activity);
    var ref = db.database().ref("/activities/" + activity_id);
    ref.set(activity, function(err){
        if(err){
            fn(activity_id, activity, err);
            return;
        }
        api.createActivities(activity_id, activity, function(err, res){
            fn(activity_id, activity, err);
        });
    });
}

Activity.init = function(user_id, fn){
    var at = this;
    User.valid(user_id, function(user){
        var activity = {
                host: user_id,
                host_gender: user.gender,
                status: 0,
                locale: user.locale
        }
        at.create(user_id, activity, fn);        
    });
}

Activity.findByKey = function(activity_id, fn){
    var ref = db.database().ref("/activities/" + activity_id);
    ref.once('value', function(snapshot){
        fn(snapshot.exists()? new Activity(snapshot.val()) : null);
    });
}