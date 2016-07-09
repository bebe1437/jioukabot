var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "5f3d9f94-cc70-4f46-bacf-39451347d0ec";
var next = "show";

  var payload ={
    route: 'hold',
    action: 'gender',
    response:{
      key: activity_id,
      value: '2',
      next: next
    }
  };

route.postback(user_id,  payload);
