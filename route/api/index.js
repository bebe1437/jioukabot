var request = require('request');
var constants = require('../../constants');

if(!constants.pageAccessToken
  || !constants.api
  || !constants.api.sendMessage
  || !constants.api.userprofile){
  
  console.log('Missing facebook userprofile api configureation');
  process.exit(1);    
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
exports.sendMessage = function(messageData, callback) {
  request({
    uri: constants.api.sendMessage,
    qs: { access_token: constants.pageAccessToken },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
      
      if(callback){
        callback();
      }
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*
 * Facebook UserProfile 
 * {
   "first_name": "Phoebe",
   "last_name": "Turing",
   "profile_pic": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/943815_1590926874501601_4115396103879685023_n.jpg?oh=2790f47c957a77b4960c2a9953e40ec3&oe=5802BCA7",
   "locale": "zh_TW",
   "timezone": 8,
   "gender": "female"
}
*/

exports.userprofile = function(user_id, fn){
  request({
    uri: constants.api.userprofile.replace('{USER_ID}', user_id),
    qs: { fields: "first_name,last_name,profile_pic,locale,timezone,gender", access_token: constants.pageAccessToken},
    method: 'GET'

  }, function (error, response, body) {
      fn(JSON.parse(body), error);
  });  
}