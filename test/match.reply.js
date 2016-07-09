var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "b3e0e6f9-d8ac-4826-8b4e-9e2b7f375cae";
var key = activity_id + '_' + user_id;
var next = "edit";

  var payload ={
    route: 'message',
    action: 'reply',
    response: {
      key: key,
      value: user_id,
      next: next
    }
  };

route.postback(user_id,  payload);
