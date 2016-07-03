var route = require("../route");
var UserSys = require('../model/UserSys');
const user_id = '1155742751164216';

UserSys.get(user_id, 'field', function(field, err){
    if(field){
        var userfield = field.value;
        route.savefield(user_id, userfield, 'testing saving field');
    }
});
