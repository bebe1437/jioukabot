var db = require("./db").get();
var uuid = require('node-uuid');

/*global Activity
* key: {activity_id}
{
    host:{user_id},
    status: 0-created, 1-canceled
    type: 電影,
    content: 來去看電影吧,
    location: 台北,
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
        fn(activity_id, activity, err);
    });
}

Activity.init = function(user_id, fn){
    var activity = {
            host: user_id,
            status: 0
    }
    this.create(user_id, activity, fn);
}

Activity.findByKey = function(activity_id, fn){
    var ref = db.database().ref("/activities/" + activity_id);
    ref.once('value', function(snapshot){
        fn(snapshot.exists()? snapshot.val() : null);
    });
}