var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "e77b8593-9c08-4bae-9d74-9efb99cbb3ed";
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
