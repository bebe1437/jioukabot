var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "e400ad10-c3bd-43bc-9d18-a2356c6f2eb8";
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
