var check = require('./check');
var route = require("./route");
var UserSys = require('./model/UserSys');
const user_id = '1155742751164216';


//help
//route.helpMessage(user_id);

/*hold
  var payload = {
    route: 'hold',
    action: 'help'
  }

route.postback(user_id,  payload);
*/

/*save field
UserSys.get(user_id, 'field', function(field, err){
    if(field){
        var userfield = field.value;
        route.savefield(user_id, userfield, 'testing saving field');
    }
});
*/
