var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "e078c2e0-ab0c-4c7c-bd4b-4ac3fc079ef9";
var next = "show";

  var payload ={
    route: 'hold',
    action: 'next',
    response:{
      key: activity_id,
      value: user_id,
      next: next
    }
  };

route.postback(user_id,  payload);
