var db = require("./db").get();

/*global Message
* key: {activity_id}_{sender_id}_{timestamp}
{
    receive_id:{user_id},
    content:,
    create_time:{timestamp}
}
*/
module.exports = Message;
function Message(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

Message.create = function(activity_id, sender_id, msg, fn){
    var key = activity_id + '_' + sender_id + '_' + Date.now();
    var ref = db.database().ref('/messages/'+key);
    msg.create_time = Date.now();
    ref.set(msg, function(err){
        fn(msg, err);
    });
}