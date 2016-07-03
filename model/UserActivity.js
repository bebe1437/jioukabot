var db = require("./db").get();

const CHARGE_FREE ="免費", CHARGE_SHARE="均攤(%s)", CHARGE_POCKETMONEY="酬庸(%s)";

/*global UserActivity
* key: {user_id}_{timpestamp}_{activity_id}
{
    created_time:timestamp,
    activity_id:,
    host:{user_id},
    status: 0-created, 1-canceled
    type: 電影,
    content: 來去看電影吧,
    location: 台北,
    charge:{
        type: 0-free, 1-share, 2-allowance
        price: 100
    }
}
*/
module.exports = UserActivity;
function UserActivity(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

UserActivity.prototype.showCharge = function(fn){
    var userActivity = this;
    var charge = userActivity.charge;
    if(!charge){
        fn('');
        return;
    }
    switch(charge.type){
        case 0:
            fn('免費');
            break;
        case 1:
            fn('均攤:'+charge.price);
            break;
        case 2:
            fn('零用錢:' + charge.price);
            break;
        default:
            fn('Not defined');
    }
}

UserActivity.create = function(user_id, activity_id, activity, fn){
    var useractivity = new UserActivity(activity);
    useractivity.activity_id = activity_id;
    var key = user_id + "_" + activity.created_time + "_" + activity_id;
    console.log('UserActivity.create.key:%s', key);
    var ref = db.database().ref("/useractivites/" + key);
    ref.set(useractivity, function(err){        
        fn(useractivity, err);
    });    
}

UserActivity.findByKey = function(user_id, activity_id, fn){
    var ref = db.database().ref("/useractivites");
    ref.orderByKey()
    .endAt(activity_id)
    .once('value', function(snapshots){
        if(!snapshots.exists()){
            fn(null);
            return;
        }
        var useractivity = null;
        snapshots.forEach(function(snapshot){
            if(snapshot.key.startsWith(user_id)){
                useractivity = snapshot.val();
                return true;
            }
        });
        fn(new UserActivity(useractivity));
    });
}

UserActivity.findAsHost = function(user_id, fn){
    var ref = db.database().ref("/useractivites");
    ref.orderByKey()
    .startAt(user_id)
    .once('value', function(snapshots){;
        if(!snapshots.exists()){
            fn(null);
            return;
        }
        
        var userActivity = null;
        snapshots.forEach(function(snapshot){
            var tmp = snapshot.val();
            console.log('each ua.host[%s] ua.status[%s]'
            , tmp.host
            , tmp.status);
            //type:0-host, status:0-created
            if(tmp.host == user_id && tmp.status == 0){
                userActivity = new UserActivity(tmp);
                return true;
            }
        });
        fn(userActivity);
    });
}

function charegeToString(charge){
    if(charge){
        var type = charge.type;
        var price = charge.price;
        switch(type){
            case 0:
                return CHARGE_FREE;
            case 1:
                return CHARGE_SHARE.replace('%s', price);
            case 2:
                return CHARGE_POCKETMONEY.replace('%s', price);
            default:
                return "";
        }        
    }
    return "";
}