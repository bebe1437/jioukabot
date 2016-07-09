var db = require("../../model/db").get();
var User = require("../../model/User");
var UserPrefer = require("../../model/UserPrefer");
var UserActivity = require("../../model/UserActivity");
var Activity = require("../../model/Activity");
var Block = require("../../model/Block");
var Match = require("../../model/Match");
var UserSys = require("../../model/UserSys");
var help = require("./help");
var route = require("../index");
var api = require("../api");
var Payload = require("../Payload");

const routes = {
  help: require("./help"),
  charge: require("./charge"),
  gender: require("./gender"),
  status: require("./status"),
  require_content: require("./require_content"),
  content: require("./content"),
  next: require("./next")
}
/*
 * payload:{
     route: 
     action: 
     response:
 }
*/
exports.process = function(recipientId, payload){
  routes[payload.action].process(recipientId, payload.response);
}

exports.save = function(recipientId, key, field, value, fn){
    var main = this;
    var updates = {};
    var updated_time = Date.now();
    updates['/userprefer/{user_id}/{field}'.replace('{user_id}', recipientId).replace('{field}', field)] = value;
    updates['/userprefer/{user_id}/updated_time'.replace('{user_id}', recipientId)] = updated_time;
    db.update(updates);
    
    UserSys.cleanField(recipientId, function(err){
        if(err){
          route.err(recipientId, err);
          return;
        }
        
        UserPrefer.find(recipientId, function(userPrefer){
            api.updateDoc('prefers', recipientId, field, value, function(err, res){
              if(err){
                route.err(recipientId, err);
                return;
              }
                if(userPrefer.content
                && userPrefer.charge
                && userPrefer.gender
                && userPrefer.status == 0){
                  setTimeout(function(){
                    main.findMatch(recipientId, userPrefer);
                  }, 5000);
                }          
              fn(recipientId, value, userPrefer);
            });
        });        
    });
}

exports.next = function(action, recipientId, value, userPrefer, next){
  switch(action){
    case 'edit':
      User.valid(recipientId, function(user){
          help.editMessage(recipientId, user.first_name, userPrefer);
        });
      break;
    default:
      route.err(recipientId, 'Undefineda action:' + action);
  }  
}

exports.requireField = function(recipientId, field, next) {
    var message;
    switch(field){
        case 'content':
            message = "哈囉！想要參加什麼活動呢？";
            break;
        default:
            route.err(recipientId, 'Not valid type for HOLD_CREATE:'+field);
            return;
    }
    var userfield = {
      route: 'match',
      field: field,
      next: next
    }
    route.requireFieldMessage(recipientId, message, userfield);
}


exports.findMatch = function(recipientId, userPrefer){
  var main = this;
  Block.list(recipientId, function(block_list){
    Match.scanActivity(recipientId, function(activity_ids){
      var blocks = block_list.concat(activity_ids);
      console.log('===matchActivity block_list:%s===', blocks);
      api.searchActivities(recipientId, userPrefer, blocks, function(hits, err){
        if(err){
          console.error('fail to search in elasticsearch:%s', err);
          return;
        }
        if(hits.total==0){
          route.sendTextMessage(recipientId, '揪咖繼續幫你找活動囉^_^');
          return;
        }
        
        User.valid(hits.obj.host, function(host, err){
          var activity_id = hits.obj.activity_id;
          host.user_id = hits.obj.host;
          User.valid(recipientId, function(user, err){
             user.user_id = recipientId;
             console.log('host:%s', JSON.stringify(host));
             console.log('matchuser:%s', JSON.stringify(user));
             Match.create(host, user, activity_id, 'match', function(match ,err){
               if(err){
                 route.err(recipientId, err);
                 return;
               }
               Activity.findByKey(activity_id, function(activity){
                 main.matchMessage(recipientId, activity_id, host, activity);
               });
             });
          });
        });
      });        
    });
  });
}

exports.matchMessage = function(recipientId, activity_id, host, activity){
      var match_key = activity_id+'_'+recipientId;
      var buttons =[
        {
            type: "postback",
            title: "回覆",
            payload: Payload.matchreply(match_key, host.user_id).output
        },{
            type: "postback",
            title: "沒興趣",
            payload: Payload.matchnext(match_key).output
        }
      ];
      
       var participant = {
        title: '跟主揪打聲招呼吧！',
        image_url: host.profile_pic,
        buttons: buttons
        }
        
      
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [participant]
            }
          }
        }
      };  
    
      var content = host.first_name.concat('來揪咖囉！詳細資訊：')
      .concat('\r\n').concat(new UserActivity(activity).output);
      route.sendTextMessage(recipientId, content, function(){
        api.sendMessage(messageData);
      });
      
}