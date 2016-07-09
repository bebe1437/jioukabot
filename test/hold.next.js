var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "ada587bd-4de5-401a-a75e-25b87214dcda";
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
