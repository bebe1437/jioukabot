module.exports = Payload;
function Payload(obj){
    for(var key in obj){
        //利用遞迴的特性把物件的key跟屬性串在一起
        this[key] = obj[key];
    }
    this["output"] = JSON.stringify(obj);
};

function init(route, action, key, value, next){
  var payload = {
      route: route,
      action: action,
      response:{
          key: key,
          value: value,
          next: next
      }
  } 
  return payload;
}

Payload.charge = function(activity_id, value, next){
    return new Payload(init('hold', 'charge', activity_id, value , next));
}

Payload.gender = function(activity_id, value, next){
    return new Payload(init('hold', 'gender', activity_id, value, next));
}

Payload.holdfield = function(activity_id, value, next){
    return new Payload(init('hold', 'field', activity_id, value, next));
}

Payload.holdstatus = function(activity_id, value,  next){
    return new Payload(init('hold', 'status', activity_id, value , next));
}