var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "53a5d64b-6da1-431f-87d9-2a9f5ee2e6f4";
var next = "show";

  var payload ={
    route: 'hold',
    action: 'charge',
    response: {
      key: activity_id,
      value: '1',
      next: next
    }
  };

route.postback(user_id,  payload);
