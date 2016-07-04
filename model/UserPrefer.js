var db = require("./db").get();

/*global UserPrefer
* key: {user_id}
{
    gender: 0-male, 1-female, 2-all
    charge: 0-free, 1-share, 2-allowance
    locale:
    status: 0-available, 1-unavailable
    updated_time:timestamp
}
*/
const gender_desc =['限男', '限女', '不限'];
const charge_desc =['免費', '均攤',  '零用錢'];
module.exports = UserPrefer;
function UserPrefer(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
    
    
    this.charge_output = charge_desc[this.charge];
    this.gender_output = gender_desc[this.gender];
    
    var output = "性別： ".concat(this.gender_output)
    .concat("\r\n費用： ").concat(this.charge_output)
    .concat("\r\n語系： ").concat(this.locale);
    
    this.output = output;
};

UserPrefer.create = function(user_id, userPrefer, fn){
    var ref = db.database().ref('/userprefer/'+user_id);
    ref.set(userPrefer, function(err){
        fn(err);
    });
}

UserPrefer.init = function(user_id, user, fn){
    this.create(user_id, {
        gender: 2,
        charge: 2,
        locale: user.locale,
        status: 1,
        updated_time: Date.now()        
    }, fn);
}

UserPrefer.find = function(user_id, fn){
    var ref = db.database().ref('/userprefer/'+user_id);
    ref.once('value', function(snapshot){
        fn(snapshot.exists()? new UserPrefer(snapshot.val()): null);
    });
}