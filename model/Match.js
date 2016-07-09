var db = require("./db").get();

/*global Match
* key: {activity_id}_{participant_id}
{
    host:{user_id},
    host_name:{first_name},
    host_gender:{gender},
    host_profile_pic:{profile_pic},
    participant:{user_id},
    participant:{gender},
    participant_name:{first_name},
    participant_profile_pic:{profile_pic}
    status: 0-availabe, 1-host-closed, 2-participant-close
    create_time:{timestamp}
}
*/
module.exports = Match;
function Match(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

Match.create = function(user, matchUser, activity_id, fn){
    var ref = db.database().ref('/matches/'+activity_id+'_'+matchUser.user_id);
    var match = {
        host: user.user_id,
        host_name: user.first_name,
        host_gender: user.gender,
        host_profile_pic: user.profile_pic,
        participant: matchUser.user_id,
        participant: matchUser.gender,
        participant_name: matchUser.first_name,
        participant_profile_pic: matchUser.profile_pic,
        status:0,
        create_time: Date.now()
    };
    ref.set(match, function(err){
        fn(match, err);
    });
}

Match.find = function(match_key, fn){
    var ref = db.database().ref('/matches/'+match_key);
    ref.once('value', function(snapshot){
        fn(snapshot.exists() ? snapshot.val(): null);
    });
};