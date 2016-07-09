var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "e77b8593-9c08-4bae-9d74-9efb99cbb3ed";
var key = activity_id + '_' + user_id;
var next = "edit";

  var payload ={
    route: 'message',
    action: 'block',
    response: {
      key: 'af21295e-434b-4f89-9119-7ab2e4b4f86f_1155742751164216',
      value: user_id,
      next: next
    }
  };

route.postback(user_id,  payload);
