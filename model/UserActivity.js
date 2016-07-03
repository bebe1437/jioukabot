var db = require("./db").get();

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
const gender_desc =['限男', '限女', '不限'];
const charge_desc =['免費', '均攤(%s)',  '酬庸(%s)'];

module.exports = UserActivity;
function UserActivity(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
        console.log('%s: %s', key, obj[key]);
    }
    var charge_str;
    if(this.charge){
       charge_str = charge_desc[this.charge.type];
       if(this.charge.price){
           charge_str = charge_str.replace('%s', this.charge.price);
       }
    }
    var gender_str = this.gender ? gender_desc[this.gender] : undefined;
    
    var output = '『來揪咖吧』'
        .concat('\r\n').concat('費用：').concat(charge_str)
        .concat('\r\n').concat('性別：').concat(gender_str)
        .concat('\r\n').concat('類別：').concat(this.type)
        .concat('\r\n').concat('地點：').concat(this.location)
        .concat('\r\n').concat('內容：').concat(this.content);    
    this.output = output;
};

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