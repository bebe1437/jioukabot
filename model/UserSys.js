var db = require("./db").get();
var uuid = require('node-uuid');
const expired_time = 5000;

/*global UserSys
* key: {user_Id}_{$field}
{
    value:,
    updated_time:timestamp
}
*/
module.exports = UserSys;
function UserSys(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

UserSys.set = function(user_id, field, value, fn){
    var path = "/usersys/{user_id}/{field}"
    .replace('{user_id}', user_id)
    .replace('{field}', field);
    
    var ref = db.database().ref(path);
    ref.set({
        value: value,
        updated_time: Date.now()
    }, function(err){
        fn(err);
    });
}

UserSys.get = function(user_id, field, fn){
    var path = "/usersys/{user_id}/{field}"
    .replace('{user_id}', user_id)
    .replace('{field}', field);
    
    var ref = db.database().ref(path);
    ref.once('value', function(snapshot){
        fn(snapshot.exists()? new UserSys(snapshot.val()): null);
    });
}

UserSys.prototype.isExpired = function(){
    var userSys = this;
    var range = Date.now() - userSys.updated_time;
    return range > expired_time;
}

UserSys.setPostback = function(user_id, value, fn){
    var sys = this;
    this.get(user_id, 'postback', function(postback){
        if(!postback){
            sys.set(user_id, 'postback', value, function(err){
                fn(err);
            });
            return;
        }
        if(!postback.isExpired()){
            fn('Receive the same postback in %d seconds.', expired_time/1000 );
            return;
        }
        sys.set(user_id, 'postback', value, function(err){
                fn(err);
        });
    });
}