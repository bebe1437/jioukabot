var db = require("./db").get();

/*global SysLog
* key: {log_type}_{timestamp}
{
    user_id:
    value:
}
*/
module.exports = SysLog;
function SysLog(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

SysLog.set = function(user_id, field, value, fn){
    var path = "/syslogs/{field}_{time}"
    .replace('{field}', field)
    .replace('{time}', Date.now());
    
    var ref = db.database().ref(path);
    ref.set({
        user_id: user_id,
        value: value
    }, function(err){
        fn(err);
    });
}