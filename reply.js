var request = require('request');
var config = require('config');
var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');
var UserSys = require('./model/UserSys');

/*
 * err: Invalid Operation
 *
 */
exports.err = function(recipientId, err){
  console.log('Invalid Operation[%s]:%s',recipientId, err);
  this.sendTextMessage(recipientId, "Invalid Operation"); 
} 

/*
 * invalid user
 *
 */
exports.invalidUser = function(recipientId, err){
  console.log('Invalid User[%s]:%s',recipientId, err);
  this.sendTextMessage(recipientId, "Invalid User, we got problem to retrive your user information."); 
} 


/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
exports.callSendAPI = function(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*
 * Send a text message using the Send API.
 *
 */
exports.sendTextMessage = function(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  this.callSendAPI(messageData);  
}

/*
 * Help
 *
 */
exports.helpMessage = function(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "歡迎來到揪咖吧！",
          buttons:[{
            type: "postback",
            title: "揪咖",
            payload: "$HOLD"
          },{
            type: "postback",
            title: "參咖",
            payload: "$ATTEND"
          }]
        }
      }
    }
  };  

  this.callSendAPI(messageData);    
}

exports.sendButtonMessage = function(recipientId, text, buttons){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    }
  };  

  this.callSendAPI(messageData);
}

/*
 * Require field message
*/
exports.requireFieldMessage = function(recipientId, messageText, field){
  console.log('===reply.requireFieldMessage===');
  console.log('require field:%s', field);
  var reply = this;
  UserSys.setField(recipientId, field, function(err){
    if(err){
      reply.err(recipientId, err);
      return;
    }
    reply.sendTextMessage(recipientId, messageText);
  });
}