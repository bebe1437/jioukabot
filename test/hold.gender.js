var route = require("../route");
const user_id = '1155742751164216';

var activity_id = "b1b23b66-3187-48e4-ae69-5f38480ae3c8";
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
