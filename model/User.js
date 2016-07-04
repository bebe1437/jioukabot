var db = require("./db").get();
var api = require('../route/api');

/*global User
*  key:{user_id}
{
   "first_name": "Phoebe",
   "last_name": "Turing",
   "profile_pic": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/943815_1590926874501601_4115396103879685023_n.jpg?oh=2790f47c957a77b4960c2a9953e40ec3&oe=5802BCA7",
   "locale": "zh_TW",
   "timezone": 8,
   "gender": "female"
}
*/
module.exports = User;
function User(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

function create(fbUserID, fn){
    console.log('===User.create===');
    api.userprofile(fbUserID, function(userprofile, error){
        if(error){
            console.log('Fail to retrieve fb userprofile:%s', fbUserID);
            fn(null, error);
            return;
        }
        var ref = db.database().ref("/users/"+fbUserID);
        ref.set(userprofile, function(err){
            if(err){
                console.log('Fail to create User:%s', fbUserID);
                fn(null, err);
                return;
            }
            
            fn(new User(userprofile));
        }); 
    });
}

function find(fbUserID, fn){
    console.log('===User.find===');
    var ref = db.database().ref("/users/"+fbUserID);
    ref.once('value', function(snapshot){
        if(snapshot.exists()){
            fn(new User(snapshot.val()));
            return;
        }
        fn(null);
    }, function(err){
        console.log('Fail to retrieve firebase with %s : %s', fbUserID, err.code);
        fn(null, err);
    });
}

/*
 * return: user
*/
User.valid = function(fbUserID, fn){
    console.log('===Validating user====');
    find(fbUserID, function(user, err){
        if(user){
            fn(user, err);
            return;
        }
        create(fbUserID, function(user, err){
            fn(user, err);
        }); 
    });
}