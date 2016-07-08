var db = require("./db").get();

/*global UserActivity
* key: {user_id}_{timpestamp}_{activity_id}
{
    created_time:timestamp,
    activity_id:,
    host:{user_id},
    status: 0-created, 1-canceled, 2-stopmatch
    content: 來去看電影吧,
    location: 台北,
    charge:{
        type: 0-free, 1-share, 2-allowance
        price: 100
    }
}
*/
const gender_desc =['限男', '限女', '不限'];
const charge_desc =['免費', '均攤($%s)',  '零用錢($%s)'];

module.exports = UserActivity;
function UserActivity(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
    if(this.charge){
       this.charge_output = charge_desc[this.charge.type];
       if(this.charge.price){
           this.charge_output = this.charge_output.replace('%s', this.charge.price);
       }
    }
    if(this.gender || this.gender == 0){
        this.gender_output = gender_desc[this.gender];
    }
    
    var output = '費用：'.concat(this.charge_output)
        .concat('\r\n').concat('性別：').concat(this.gender_output)
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
    .once('value', function(snapshots){
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