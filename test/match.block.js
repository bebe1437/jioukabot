var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "e77b8593-9c08-4bae-9d74-9efb99cbb3ed";
var key = activity_id + '_' + user_id;
var next = "edit";

  var payload ={
    route: 'message',
    action: 'block',
    response: {
      key: 'd6fc35a8-4d40-40ab-a14e-ff95a547ac50_1155742751164216',
      value: user_id,
      next: next
    }
  };

route.postback(user_id,  payload);
