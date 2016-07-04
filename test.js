var request = require('request');
var constants = require('./constants');
const user_id = '1155742751164216';

  request({
    uri: constants.api.userprofile.replace('{USER_ID}', user_id),
    qs: { fields: "first_name,last_name,profile_pic,locale,timezone,gender", access_token: constants.pageAccessToken},
    method: 'GET'

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      //console.error(error);
    }
  });  