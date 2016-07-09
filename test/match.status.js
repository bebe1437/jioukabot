var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "d3629d69-43e3-4951-9dec-b2934474101a";
var next = "edit";

  var payload ={
    route: 'match',
    action: 'status',
    response: {
      key: activity_id,
      value: 0,
      next: next
    }
  };

route.postback(user_id,  payload);
