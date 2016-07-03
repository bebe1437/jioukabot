var db = require("./db").get();

/*global Participant
* key: {activity_id}_{timestamp}_{user_id}
{
    profile_pic:,
    first_name:,
    last_name:,
    gender:,
    status: 0-applied, 1-hired, 2-regreted
}
*/
module.exports = Participant;
function Participant(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
};