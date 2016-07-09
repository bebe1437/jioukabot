var db = require("./db").get();
var uuid = require('node-uuid');
var User = require("./User");
var api = require('../route/api');

/*global Block
* key: {activity_id/user_id}_{timestamp}
{
   value: user_id/activity_id
}
*/
module.exports = Block;
function Block(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};

Block.create = function(main_id, block_id, fn){
    var key = '/blocks/'+main_id+'_'+Date.now();
    var ref = db.database().ref(key);
    ref.set(block_id, function(err){
        fn(err);
    });
}

Block.list = function(activity_id, fn){
    var ref = db.database().ref('/blocks');
    ref.startAt(activity_id+'_')
    .once('value', function(snapshots){
        var block_list = [];
        snapshots.forEach(function(snapshot){
            block_list.push(snapshot.val());
        });
        fn(block_list);
    });
}