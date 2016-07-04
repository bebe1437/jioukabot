var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "d3629d69-43e3-4951-9dec-b2934474101a";
var next = "show";

  var payload ={
    route: 'hold',
    action: 'attend',
    response: {
      key: activity_id,
      value: '1',
      next: next
    }
  };

route.postback(user_id,  payload);
