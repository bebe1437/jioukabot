var db = require("./db").get();
var uuid = require('node-uuid');

/*global Match
* key: {activity_id}_{locale}_{charge}_{gender}
{
    copy field from Activity
}
*/
module.exports = Match;
function Match(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

Match.create = function(user_id,activity_id, activity, fn){
    if(!activity_id
    || !activity
    || !(activity.gender == 0 || activity.gender ==1)
    || !activity.charge
    || !activity.locale){
        return;
    }
    
    var key ="{activity_id}_{gender}_{charge}_{locale}"
    .replace("{activity_id}", activity_id)
    .replace("{gender}", activity.gender)
    .replace("{charge}", activity.charge.type)
    .replace("{locale}", activity.locale);
    
    activity.activity_id = activity_id;
    var ref = db.database().ref("/matches/" + key);
    ref.set(activity, function(err){
        fn(new Match(activity), err);
    });
}